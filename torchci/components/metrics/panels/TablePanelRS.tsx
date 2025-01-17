/*
This file is an exact copy of TablePanel.tsx prior to moving it to only use
ClickHouse.  After Jan 1 2025, this file will be deleted and all pages depending
on it will be broken.
*/
import HelpIcon from "@mui/icons-material/Help";
import { Skeleton, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { RocksetParam } from "lib/rockset";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TablePanel({
  // Human-readable title for this panel.
  title,
  // Query lambda collection in Rockset.
  queryCollection = "metrics",
  // Query lambda name in Rockset, ("metrics" collection is assumed).
  queryName,
  // Params to pass to the Rockset query.
  queryParams,
  // Column definitions for the data grid.
  columns,
  // Props to propagate to the data grid.
  dataGridProps,
  // An optional help link to display in the title
  helpLink,
  // An optional flag to show the table footer
  showFooter,
  useClickHouse = false,
}: {
  title: string;
  queryCollection?: string;
  queryName: string;
  queryParams: RocksetParam[] | {};
  columns: GridColDef[];
  dataGridProps: any;
  helpLink?: string;
  showFooter?: boolean;
  useClickHouse?: boolean;
}) {
  const url = useClickHouse
    ? `/api/clickhouse/${queryName}?parameters=${encodeURIComponent(
        JSON.stringify(queryParams)
      )}`
    : `/api/query/${queryCollection}/${queryName}?parameters=${encodeURIComponent(
        JSON.stringify(queryParams)
      )}`;

  const { data } = useSWR(url, fetcher, {
    refreshInterval: 5 * 60 * 1000, // refresh every 5 minutes
  });

  return (
    <TablePanelWithData
      title={title}
      data={data}
      columns={columns}
      dataGridProps={dataGridProps}
      helpLink={helpLink}
      showFooter={showFooter}
    />
  );
}

export function TablePanelWithData({
  // Human-readable title for this panel.
  title,
  // The raw data to display in the table
  data,
  // Column definitions for the data grid.
  columns,
  // Props to propagate to the data grid.
  dataGridProps,
  // An optional help link to display in the title
  helpLink,
  // An optional flag to show the table footer
  showFooter,
}: {
  title: string;
  data: any;
  columns: GridColDef[];
  dataGridProps: any;
  helpLink?: string;
  showFooter?: boolean;
}) {
  if (data === undefined) {
    return <Skeleton variant={"rectangular"} height={"100%"} />;
  }

  function helpLinkOnClick() {
    window.open(helpLink, "_blank");
  }

  function Header() {
    return (
      <Typography fontSize="16px" fontWeight="700" sx={{ p: 1 }}>
        {title}{" "}
        {helpLink !== undefined && (
          <IconButton size="small" onClick={helpLinkOnClick}>
            <HelpIcon fontSize="inherit" color="info" />
          </IconButton>
        )}
      </Typography>
    );
  }

  return (
    <DataGrid
      {...dataGridProps}
      density={"compact"}
      rows={data}
      columns={columns}
      hideFooter={!showFooter}
      autoPageSize={showFooter}
      components={{
        Toolbar: Header,
      }}
    />
  );
}
