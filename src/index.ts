
import mysql from 'mysql2/promise'
import {getLatestBySource} from './queries';



async function initReportsEPC(db: mysql.Pool) {
  await db.query(
    "insert ignore into epc_sources (slug, description) values (?, ?)",
    ["cleanapp", "brands identified from cleanapp reports"]
  )

  await db.query(
    "insert ignore into epc_campaigns (name, description) values (?, ?)",
    ["reports_notify", "automatic notification of new reports from report_analysis table"]
  )
}



async function runSendReports(db: mysql.Pool) {
  let report = getNextReportToProcess(db)
}


async function getNextReportToProcess(db: mysql.Pool) {

  let startReportSeq = await getStartReportsSeq(db)

  let sql = `
  select * from report_analysis
  where seq >= ? & is_valid & language = "en"
  order by seq asc limit 1
  `

  let [r] = await db.query(sql, [startReportSeq])
}

async function getStartReportsSeq(db: mysql.Pool) {

  let latest = await getLatestBySource(db, "cleanapp")

  if (latest) {
    return latest.metadata.report_seq + 1
  } else {

    let key = 'EPC_REPORTS_START_SEQ'
    let v = process.env[key]

    if (typeof v == 'undefined') {
      console.warn(
        `EPC reports process first run; set environment variable ${key} ` +
        `to the starting report sequence number (seq).`
      )
      await new Promise((r) => setTimeout(r, 10000))
      process.exit(1)
    }

    return parseInt(v)
  }
}





async function main() {
  var db  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.DB_HOST,
    port            : Number(process.env.DB_PORT || 3306),
    user            : process.env.DB_USER,
    password        : process.env.DB_PASSWORD,
    database        : process.env.DB_NAME
  });

  await runSendReports(db)
  await db.end()
}


main()
