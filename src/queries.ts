
import mysql from 'mysql2/promise'
import {EPCSources, Outbox} from './types'



export async function getLatestBySource<K extends keyof EPCSources>(db: mysql.Pool, source: K) {
  let sql = `
  select o.* from epc_outbox o
  inner join epc_contracts c on c.id = o.contract_id
  where c.source = ?
  order by o.id desc
  limit 1
  `

  let [r, _] = await db.query<Outbox<K>[]>(sql, [source])
  return r[0]
}


