

-- MySQL schema for EPCs (Ethereum Place Codes)
--
-- Ethereum Place Codes are Ethereum adderesses derived from a key string.
-- The key is defined as: "{epc_sources.key}/{epc_contracts.id}"
--


-- Sources refers to where the place code comes from (e.g. google place code, cleanapp report)
create table if not exists epc_sources (
  slug varchar(255) not null,
  description varchar(255) not null,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (slug)
);

-- Campaign refers to the process / batch / marketing campaign
create table if not exists epc_campaigns (
  id int unsigned not null,
  name varchar(255) not null unique,
  description varchar(255),
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id)
);

-- Contract refers to an EPC; it has an address derived from a key
create table if not exists epc_contracts (
  id int unsigned not null,
  source varchar(255) not null,
  slug varchar(255) not null unique,
  address varchar(255) not null unique,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  FOREIGN KEY (source) REFERENCES epc_sources(slug)
);

-- The template used to send a message (should not be updated)
create table if not exists epc_sent_message_templates_read_only (
  id int unsigned AUTO_INCREMENT,
  body text not null,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id)
);

-- Sent messages
create table if not exists epc_outbox (
  id int unsigned AUTO_INCREMENT,
  campaign_id int unsigned not null,
  contract_id int unsigned not null,
  metadata_json JSON,
  status ENUM('held', 'pending', 'sent', 'error'),
  sent_message_template_id int unsigned,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  FOREIGN KEY (campaign_id) REFERENCES epc_campaigns(id),
  FOREIGN KEY (contract_id) REFERENCES epc_contracts(id),
  FOREIGN KEY (sent_message_template_id) REFERENCES epc_sent_message_templates_read_only(id)
);
