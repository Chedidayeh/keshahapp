import { BigQuery } from "@google-cloud/bigquery";

const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID_MOETEZ,
  credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY_MOETEZ!),
});

export default bigquery;
