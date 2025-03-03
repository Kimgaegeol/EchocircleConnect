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

    const checkUser = await client.query(getUserId, [decryptedCI]);

    if (checkUser.rows.length == 0)
      throw customError("해당 ci로 등록된 회원이 존재하지 않습니다.", 404);

    const userId = checkUser.rows[0].user_id;

    const userData = await client.query(m001, [userId]);

    if (userData.rows.length == 0) {
      res.status(200).send({
        resultCode: "0000",
        resultMessage: "개인 포인트 정보 조회 성공",
        data: {
          memberUid: userId,
          pointBalance: 0,
        },
      });
    }

    const accPoint = userData.rows[0].acc_point;

    res.status(200).send({
      resultCode: "0000",
      resultMessage: "개인 포인트 정보 조회 성공",
      data: {
        memberUid: userId,
        pointBalance: accPoint,
      },
    });
  })
);

router.post(
  "/point-transfer",
  trycatchWrapper(async (req, res, next) => {
    const { ci, request_point } = req.body;

    if (!ci || !request_point)
      throw customError("필수값이 들어오지 않았습니다.", 400);
    if (request_point < 2000 || request_point > 1000000)
      throw customError(
        "환전할 포인트 2,000 포인트 미만, 1,000,000 포인트 초과.",
        400
      );

    const decryptedCI = decryptCI(
      ci,
      process.env.AES256CBCKEY,
      process.env.AES256CBCIV
    );
    console.log("Decrypted CI:", decryptedCI);

    const checkUser = await client.query(getUserId, [decryptedCI]);

    if (checkUser.rows.length == 0)
      throw customError("해당 ci로 등록된 회원이 존재하지 않습니다.", 404);

    const userId = checkUser.rows[0].user_id;

    const userData = await client.query(m001, [userId]);

    if (userData.rows.length == 0)
      throw customError(
        "보유 포인트 잔액이 신청한 포인트 잔액보다 더 적음",
        409
      );

    const accPoint = userData.rows[0].acc_point;
    console.log(accPoint);

    if (request_point > accPoint)
      throw customError(
        "보유 포인트 잔액이 신청한 포인트 잔액보다 더 적음",
        409
      );

    const description = "포인트 환전";
    const point = -request_point;
    const acc_point = accPoint - request_point;
    const inout_type = "OUT";
    const memo = "인천시 포인트로 환전(에코허브)";
    const owner_id = userId;
    const trader_id = userId;

    const result = client.query(m002, [
      description,
      point,
      acc_point,
      inout_type,
      memo,
      owner_id,
      trader_id,
    ]);

    res.status(201).send({
      resultCode: "0000",
      resultMessage: "포인트 환전 신청 성공",
    });
  })
);

module.exports = router;
