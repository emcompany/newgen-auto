-- Table: public.tblmasitem

-- DROP TABLE IF EXISTS public.tblmasitem;

CREATE TABLE IF NOT EXISTS public.tblmasitem
(
    itemcode bigint NOT NULL,
    groupid bigint,
    makeid bigint,
    brandid bigint,
    itemname character varying(200) COLLATE pg_catalog."default",
    packing character varying(20) COLLATE pg_catalog."default",
    suppref character varying(10) COLLATE pg_catalog."default",
    barcode character varying(15) COLLATE pg_catalog."default",
    cost money,
    avgcost money,
    curstock real,
    sprice money,
    mrp money,
    unit character varying(6) COLLATE pg_catalog."default",
    shelf character varying(10) COLLATE pg_catalog."default",
    partno character varying(20) COLLATE pg_catalog."default",
    model character varying(100) COLLATE pg_catalog."default",
    cgst real,
    sgst real,
    igst real,
    hsncode character varying(10) COLLATE pg_catalog."default",
    partyid bigint,
    isexpence boolean,
    deleted boolean,
    created_date timestamp without time zone NOT NULL DEFAULT now(),
    edited_date timestamp without time zone NOT NULL DEFAULT now(),
    billable boolean,
    CONSTRAINT tblmasitem_pkey PRIMARY KEY (itemcode),
    CONSTRAINT tblmasitem_brandid_fkey FOREIGN KEY (brandid)
        REFERENCES public.tblmasbrand (brandid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT tblmasitem_groupid_fkey FOREIGN KEY (groupid)
        REFERENCES public.tblmasgroup (groupid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT tblmasitem_makeid_fkey FOREIGN KEY (makeid)
        REFERENCES public.tblmasmake (makeid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT tblmasitem_partyid_fkey FOREIGN KEY (partyid)
        REFERENCES public.tblmasparty (partyid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.tblmasitem
    OWNER to postgres;