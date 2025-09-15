CREATE TABLE login (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE tblfinyear (
    finyearid BIGINT PRIMARY KEY,
    finyearname VARCHAR(50),
    fydatefrom TIMESTAMP,
    fydateto TIMESTAMP
);

CREATE TABLE tblmasbrand (
    brandid BIGINT PRIMARY KEY,
    brandname VARCHAR(100),
    created_date TIMESTAMP DEFAULT now(),
    edited_date TIMESTAMP DEFAULT now()
);

CREATE TABLE tblmasgroup (
    groupid BIGINT PRIMARY KEY,
    groupname VARCHAR(100),
    created_date TIMESTAMP DEFAULT now() NOT NULL,
    edited_date TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE tblmasitem (
    itemcode BIGINT PRIMARY KEY,
    groupid BIGINT,
    makeid BIGINT,
    brandid BIGINT,
    itemname VARCHAR(200),
    packing VARCHAR(20),
    suppref VARCHAR(10),
    barcode VARCHAR(15),
    cost NUMERIC(12,2),
    avgcost NUMERIC(12,2),
    curstock REAL,
    sprice NUMERIC(12,2),
    mrp NUMERIC(12,2),
    unit VARCHAR(6),
    shelf VARCHAR(10),
    partno VARCHAR(20),
    model VARCHAR(100),
    cgst NUMERIC(5,2),
    sgst NUMERIC(5,2),
    igst NUMERIC(5,2),
    hsncode VARCHAR(10),
    partyid BIGINT,
    isexpence BOOLEAN,
    deleted BOOLEAN,
    created_date TIMESTAMP DEFAULT now() NOT NULL,
    edited_date TIMESTAMP DEFAULT now() NOT NULL,
    billable BOOLEAN
);

CREATE TABLE tblmasmake (
    makeid BIGINT PRIMARY KEY,
    makename VARCHAR(100),
    created_date TIMESTAMP DEFAULT now() NOT NULL,
    edited_date TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE tblmasparty (
    partyid BIGINT PRIMARY KEY,
    partycode BIGINT,
    partytype SMALLINT,
    partyname VARCHAR(100),
    contactno VARCHAR(20),
    address1 VARCHAR(50),
    accountid SMALLINT,
    gstnum VARCHAR(30),
    address2 VARCHAR(50),
    created_date TIMESTAMP DEFAULT now() NOT NULL,
    edited_date TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE tbltrnpurchase (
    fyearid SMALLINT,
    tranid BIGINT PRIMARY KEY,
    trno BIGINT,
    trdate DATE,
    suppinvno VARCHAR(20),
    suppinvdt DATE,
    partyid BIGINT,
    remark VARCHAR(50),
    invamt REAL,
    tptcharge REAL,
    labcharge REAL,
    misccharge REAL,
    packcharge REAL,
    rounded REAL,
    cgst REAL,
    sgst REAL,
    igst REAL,
    costsheetprepared BOOLEAN,
    grnposted BOOLEAN,
    costconfirmed BOOLEAN,
    created_date TIMESTAMP DEFAULT now(),
    edited_date TIMESTAMP DEFAULT now()
);

CREATE TABLE tbltrnpurchasecosting (
    costtrid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pruchmasid BIGINT NOT NULL,
    ohtype VARCHAR(100) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    referenceno VARCHAR(50),
    ohdate DATE,
    remark VARCHAR(200)
);

CREATE TABLE tbltrnpurchasedet (
    fyearid SMALLINT NOT NULL,
    trid BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tranmasid BIGINT NOT NULL,
    srno BIGINT,
    itemcode BIGINT NOT NULL,
    qty NUMERIC(12,2),
    rate NUMERIC(12,2),
    invamount NUMERIC(12,2),
    ohamt NUMERIC(12,2),
    netrate NUMERIC(12,2),
    rounded NUMERIC(4,2),
    cgst NUMERIC(12,2),
    sgst NUMERIC(12,2),
    igst NUMERIC(12,2),
    gtotal NUMERIC(12,2),
    cgstp NUMERIC(5,2),
    sgstp NUMERIC(5,2),
    igstp NUMERIC(5,2)
);
