const client = require("./../db/db");
const axios = require("axios");

const echoHubHostName = process.env.ECHOHUBHOSTNAME;
const echoHubPort = process.env.ECHOHUBPORT;
const { echoHubPath } = require("./../constant/url");

const { d001Pet } = require("./../db/query");

const apiService = async (path, token, postData) => {
  try {
    const response = await axios.post(
      `http://${echoHubHostName}:${echoHubPort}${path}`,
      postData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 요청 시간 제한 (10초)
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      // 서버가 응답을 반환한 경우
      console.error("Error Response:", error.response.data);
      throw new Error(
        `API Error: ${error.response.status} - ${
          error.response.data.message || error.response.statusText
        }`
      );
    } else if (error.request) {
      // 요청이 전송되었지만 응답을 받지 못한 경우 (타임아웃 포함)
      console.error("No Response received:", error.request);
      throw new Error("API Error: No response received from the server.");
    } else {
      // 요청을 설정하는 중에 오류가 발생한 경우
      console.error("Request Error:", error.message);
      throw new Error(`API Request Error: ${error.message}`);
    }
  }
};

const bringTokenLogic = async () => {
  try {
    const postData = JSON.parse(process.env.AO2INFO); // 환경변수에서 가져온 JSON 문자열을 객체로 변환

    const data = await apiService(
      echoHubPath.token,
      process.env.TESTTOKEN,
      postData
    );

    console.log("Token Response:", data);
    return data;
  } catch (error) {
    console.error("bringTokenLogic Error:", error.message);
    throw error; // 에러를 상위 호출 스택으로 전달
  }
};

const d001APILogic = async () => {
  try {
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

    console.log(data);
  } catch (e) {
    console.error(e.message);
  }
};

module.exports = { d001APILogic, apiService };
