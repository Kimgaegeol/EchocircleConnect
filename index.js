const express = require("express");
const cors = require("cors");

require("dotenv").config();

// 매일 12시마다 d001실행
const { dailyTask } = require("./src/util/scheduler");

const app = express();

app.use(cors());

app.use(express.json());

dailyTask();

const deviceRouter = require("./src/router/device");
app.use("/device", deviceRouter);

const notFoundMiddleware = require("./src/middleware/notFoundMiddleware");
app.use(notFoundMiddleware);

const errorHandlerMiddleware = require("./src/middleware/errorHandler");
app.use(errorHandlerMiddleware);

const port = process.env.PORT;
app.listen(port, "0.0.0.0", () => {
  console.log(`${port}번 포트에서 웹 서버 실행됨`);
});
