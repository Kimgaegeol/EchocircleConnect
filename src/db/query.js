//Pet,Cup 두 테이블에서 기기 정보 받아오는 query
const d001Pet =
  "SELECT id, name, address, address_detail, loc_lat, loc_lng FROM pet_device";
const d001Cup =
  "SELECT id, name, address, address_detail, loc_lat, loc_lng FROM plastic_cup_device";

// id를 받지 못할 경우 (가장 최근의 값 기준 query)
// 회수 정보값 받아오는 query(근데 테이블상에서 제대로 얻어올 수 있는 값이 없어서 그냥 임의로 넣음)
const d002 =
  "SELECT curr_count, dev_type FROM device_item_count WHERE dev_id=$1";
// Pet,Cup 두 테이블에서 사용자의 기기 사용 정보 받아오는 query
const d003Pet =
  "SELECT machine_id, phone, point, created_at, weight FROM pet_point_history ORDER BY id DESC LIMIT 1";
const d003GetCi = "SELECT * FROM user_ci WHERE phone=$1";
const d003Cup =
  "SELECT machine_id, user_id, cup_count, created_at, weight FROM cup_point_history ORDER BY id DESC LIMIT 1";
// device 상태 변경 시 변경 정보 받아오는 query
const d004 =
  "SELECT dev_id, status FROM device_log ORDER BY created_at DESC LIMIT 1";
// device 적립 개수 변경 시 변경 정보 받아오는 query
const d005 =
  "SELECT dev_id, dev_type, curr_count FROM device_item_count ORDER BY id DESC LIMIT 1";
// ci값으로 해당 유저 조회
const getUserPhone = "SELECT phone FROM user_ci WHERE ci=$1";
// phone번호로 유저 idx 조회
const getUserId =
  "SELECT user_id FROM login_account WHERE phone=(SELECT phone FROM user_ci WHERE ci=$1)";

const m001 =
  "SELECT * FROM wallet_point_history WHERE owner_id=$1 ORDER BY id DESC LIMIT 1";

const m002 =
  "INSERT INTO wallet_point_history(description,point,acc_point,inout_type,trans_state,memo,owner_id,trader_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8)";

module.exports = {
  d001Pet,
  d001Cup,
  d002,
  d003Pet,
  d003GetCi,
  d003Cup,
  d004,
  d005,
  getUserPhone,
  getUserId,
  m001,
  m002,
};
