import os
import time
import calendar
import json
import requests
import pandas as pd
import numpy as np
from tqdm import tqdm
from datetime import datetime, timedelta
from sqlalchemy import create_engine, inspect, text


start_year = 2019
end_year = 2023


def drop_table(engine):
    inspector = inspect(engine)
    table_names = inspector.get_table_names(schema="stg")
    if "decision" in table_names:
        print("DECISION TABLE FOUND. DROPPING")
        with engine.connect() as connection:
            connection.execute(text("DROP TABLE stg.decision"))
            connection.commit()


def is_hashable(x):
    try:
        hash(x)
        return True
    except TypeError:
        return False


def unfold_cols(df):
    def get_first_value(lst):
        if len(lst) > 0:
            return lst[0]
        else:
            return None

    def process_list(obj):
        if isinstance(obj, list) and len(obj) > 0:
            try:
                kae = obj[0]["kae"]
                return kae
            except:
                return None
        elif isinstance(obj, float):
            return None
        else:
            return None

    if df.shape[0] != 0:
        df = df.copy()

        if "extraFieldValues.amountWithVAT.amount" in df.columns:
            df["extraFieldValues.amountWithVAT.amount"] = df[
                "extraFieldValues.amountWithVAT.amount"
            ].apply(
                lambda x: x[0]["amountWithVAT"]
                if isinstance(x, list)
                and len(x) > 0
                and isinstance(x[0], dict)
                and "amountWithVAT" in x[0]
                else x
            )

        if "extraFieldValues.amountWithKae" in df.columns:
            df["kae"] = df["extraFieldValues.amountWithKae"].apply(
                lambda x: process_list(x)
            )
        df["thematicCategoryIds"] = df["thematicCategoryIds"].apply(get_first_value)
        df["signerIds"] = df["signerIds"].apply(get_first_value)
    return df


def select_cols(df):
    columns_map = {
        "ada": "ada",
        "subject": "subject",
        "protocolNumber": "protocol_number",
        "publishTimestamp": "publish_date",
        "organizationId": "organization",
        "decisionTypeId": "decision_type",
        "extraFieldValues.amountWithVAT.amount": "amount",
        "thematicCategoryIds": "thematic_category",
        "kae": "kae",
        "documentUrl": "pdf_url",
        "signerIds": "signer",
        "status": "status",
    }
    for col in columns_map.keys():
        if col not in df.columns:
            df[col] = np.nan

    df = df[list(columns_map.keys())].rename(columns=columns_map)

    return df


def download_data(reduce=False, write_to_db=False):
    orgs_url = "https://diavgeia.gov.gr/opendata/organizations?category=MUNICIPALITY"
    details_url = "https://diavgeia.gov.gr/opendata/search/advanced"
    engine = create_engine("postgresql://postgres:password@localhost:5432/postgres")
    response = requests.get(orgs_url, timeout=100)
    orgs = response.json()["organizations"]
    df_master = pd.DataFrame()
    drop_table(engine)
    for org in tqdm(orgs):
        # df = pd.DataFrame()
        uid = org["uid"]
        current_date = datetime(start_year, 1, 1)
        end_day = calendar.monthrange(end_year, 12)[1]
        end_date = datetime(end_year, 12, end_day)

        while current_date <= end_date:
            df = pd.DataFrame()
            next_date = current_date + timedelta(days=180)
            page_num = 0

            while True:
                params = {
                    "q": f'organizationUid:"{uid}" AND decisionTypeUid:["Γ.3.4","Δ.2.2","Β.1.3"] AND issueDate:[DT({current_date.strftime("%Y-%m-%dT00:00:00")}) TO DT({next_date.strftime("%Y-%m-%dT23:59:59")})]',
                    "page": page_num,
                    "size": 500,
                }

                try:
                    details_response = requests.get(
                        details_url, params=params, timeout=200
                    )
                except requests.exceptions.ReadTimeout:
                    print(f"TIMEOUT FOR ORG: {org}. SKIPPING")
                    break

                details = details_response.json()
                decisions_df = pd.DataFrame(details["decisions"])
                decisions_df["municipality_name"] = org["label"]
                flatten_df = pd.json_normalize(decisions_df.to_dict("records"))
                df = pd.concat([df, flatten_df], axis=0, join="outer")

                if details["info"]["actualSize"] < details["info"]["size"]:
                    break

                page_num += 1
                time.sleep(1)

            # df_master = pd.concat([df_master, df], ignore_index=True)

            if write_to_db:
                df = unfold_cols(df)
                df = select_cols(df)
                # df = filter_df(df)
                df.to_sql(
                    "decision",
                    engine,
                    if_exists="append",
                    index=False,
                    schema="stg",
                )

            if reduce:
                break

            current_date = next_date

    return df_master


if __name__ == "__main__":
    download_data(write_to_db=True)
