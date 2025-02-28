const router = require("express").Router();
const trycatchWrapper = require("./../module/trycatchWrapper");
const customError = require("./../module/customError");

const { echoHubPath } = require("./../constant/url");

const echohubToken = process.env.ECHOHUBTOKEN;

const client = require("./../db/db");
const { d001Pet, d002, d003Pet, d004, d005 } = require("./../db/query");

const regex = require("./../constant/regx");
const { nonNegativeNumberRegex } = regex;

const { apiService } = require("./../service/apiService");

//D-001
router.post(
  "/d001",
  trycatchWrapper(async (req, res, next) => {
    const resultPet = await client.query(d001Pet);

    const totalCount = resultPet.rowCount; // D-001의 total_count
    let list = []; // D-001의 request type으로 가공된 데이터를 닮을 list

    // request type으로 데이터 가공
    resultPet.rows.forEach((elem) => {
      const obj = {
        location: {
          name: elem.name,
          address: elem.address,
          latitude: elem.loc_lat,
          longitude: elem.loc_lng,
        },
        device_id: elem.id,
        device_name: elem.name,
      };
      list.push(obj); // 가공된 데이터 list에 push
    });

    // D-001 API에 데이터 전송하는 과정
    const postData = {
      summary: {
        total_count: totalCount,
      },
      list: list,
    };

    const data = await apiService(echoHubPath.d001, echohubToken, postData);

    res.status(200).send({
      data: data,
    });
  })
);

//D-002
router.post(
  "/d002",
  trycatchWrapper(async (req, res, next) => {
    const deviceId = req.body.id;

    if (!nonNegativeNumberRegex.test(deviceId)) {
      throw customError("id 정규표현이 맞지 않습니다.", 400);
    }

    const result = await client.query(d002, [deviceId]);

    const { dev_type: wasteType, curr_count: wasteAmount } = result.rows[0];

    const collectAt = Date.now();

    const postData = {
      detail: [{ waste_type: wasteType, waste_amount: wasteAmount }],
      device_id: deviceId,
      collect_at: collectAt,
    };

    const data = await apiService(echoHubPath.d002, echohubToken, postData);

    res.status(200).send({
      data: data,
    });
  })
);

//D-003
router.post(
  "/d003",
  trycatchWrapper(async (req, res, next) => {
    const result = await client.query(d003Pet); // table에서 api에 전송할 데이터만 가져옴

    const wasteType = "PET";
    const wasteAmount = result.rows[0].point;
    const deviceId = result.rows[0].machine_id;
    const memberUid = result.rows[0].user_id;
    const useAt = new Date(result.rows[0].created_at).getTime();
    const totalWasteAmount = result.rows[0].point;
    const reservePoint = result.rows[0].point;
    // const reservePoint = result.rows[0].weight;

    const postData = {
      detail: [{ waste_type: wasteType, waste_amount: wasteAmount }],
      device_id: deviceId,
      member_uid: memberUid,
      use_at: useAt,
      total_waste_amount: totalWasteAmount,
      reserve_point: reservePoint,
    };

    const data = await apiService(echoHubPath.d003, echohubToken, postData);

    res.status(200).send({
      data: data,
    });
  })
);

router.post(
  "/d004",
  trycatchWrapper(async (req, res, next) => {
    const result = await client.query(d004); // table에서 api에 전송할 데이터만 가져옴

    const deviceId = result.rows[0].dev_id;
    let status = result.rows[0].status;

    if (status.length > 15) {
      status = status.substring(0, 15);
    }

    const postData = {
      device_id: deviceId,
      status: status,
    };

    const data = await apiService(echoHubPath.d004, echohubToken, postData);

    res.status(200).send({
      data: data,
    });
  })
);

router.post(
  "/d005",
  trycatchWrapper(async (req, res) => {
    const result = await client.query(d005); // table에서 api에 전송할 데이터만 가져옴

    const wasteType = result.rows[0].dev_type == 1 ? "PET" : "PLASTIC_CUP";
    const wasteAmount = result.rows[0].curr_count;
    const deviceId = result.rows[0].dev_id;

    const postData = {
      storage: [
        {
          waste_type: wasteType,
          waste_amount: wasteAmount,
        },
      ],
      device_id: deviceId,
    };

    const data = await apiService(echoHubPath.d005, echohubToken, postData);

    res.status(200).send({
      data: data,
    });
  })
);

module.exports = router;
