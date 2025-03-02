const router = require("express").Router();
const client = require("./../db/db");

const trycatchWrapper = require("./../module/trycatchWrapper");
const customError = require("./../module/customError");

const { getUserPhone, getUserId, m001, m002 } = require("./../db/query");
const { encryptCI, decryptCI } = require("./../util/crypto");

router.get(
  "/member/:ci/point",
  trycatchWrapper(async (req, res, next) => {
    const { ci } = req.params;

    if (!ci) throw customError("ci 값이 들어오지 않았습니다.", 400);

    const decryptedCI = decryptCI(
      ci,
      process.env.AES256CBCKEY,
      process.env.AES256CBCIV
    );
    console.log("Decrypted CI:", decryptedCI);

    const userId = client.query(getUserId, [decryptCI]);

    if (userId.rows.length == 0)
      throw customError("해당 ci로 등록된 회원이 존재하지 않습니다.", 404);

    const result = client.query(m001, [userId]);

    if (result.rows.length == 0) {
      res.status(200).send({
        result_code: "0000",
        result_message: "개인 포인트 정보 조회 성공",
        data: {
          member_uid: userId,
          point_balance: 0,
        },
      });
    }
    res.status(200).send({
      result_code: "0000",
      result_message: "개인 포인트 정보 조회 성공",
      data: {
        member_uid: userId,
        point_balance: result.rows[0].acc_point,
      },
    });
  })
);

router.post(
  "/point-transfer",
  trycatchWrapper(async (req, res, next) => {
    const { ci, request_point } = req.body;
  })
);

module.exports = router;
