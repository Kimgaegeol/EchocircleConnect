const cron = require("node-cron");
const { d001APILogic } = require("./../service/apiService");

const dailyTask = () => {
  cron.schedule("0 0 * * *", async () => {
    // 00:00시가 되면 자동으로 함수 실행 , * * * => 매일 매월 매요일 실행
    await d001APILogic();
  });
};

module.exports = { dailyTask };
