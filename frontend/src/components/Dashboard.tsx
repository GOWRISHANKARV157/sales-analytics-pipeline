import { useEffect, useState } from "react";
import axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from "recharts";
import api from "../api/axios";

const CATEGORY_COLORS = [
  "#4F46E5",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#e11212",
  "#8B5CF6",
  "#06B6D4",
  "#0F766E",
];

interface UploadData {
  id: number;
  filename: string;
  status: string;
  totalRows: number;
}

interface UploadStatus {
  uploadId: number;
  filename: string;
  status: string;
  totalRows: number;
  processedRows: number;
  validRows: number;
  invalidRows: number;
  duplicates: number;
  progress: number;
}

interface AnalyticsData {
  totalRevenue: number;
  averageOrderValue: number;
  medianTransactionValue: number;
  discountLoss: number;
  standardDeviation: number;
  revenueByRegion: Record<string, number>;
  revenueByCategory: Record<string, number>;
  top5Transactions: {
    transactionId: string;
    region: string;
    productCategory: string;
    netAmount: number;
  }[];
  dailyRevenue: Record<string, number>;
}

interface DashboardProps {
  userName: string;
  onLogout: () => void;
}

function Dashboard({
  userName,
  onLogout,
}: DashboardProps) {
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [upload, setUpload] =
    useState<UploadData | null>(null);

  const [status, setStatus] =
    useState<UploadStatus | null>(null);

  const [analytics, setAnalytics] =
    useState<AnalyticsData | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!upload) {
      return;
    }

    if (
      status?.status === "COMPLETED" ||
      status?.status === "FAILED"
    ) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response =
          await api.get<UploadStatus>(
            `/uploads/${upload.id}/status`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        setStatus(response.data);
      } catch (err) {
        console.error(
          "Failed to fetch upload status:",
          err
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [upload, status?.status, token]);

  async function handleUpload() {
    if (!selectedFile) {
      setError("Please select a CSV file.");
      return;
    }

    setError("");
    setMessage("");
    setAnalytics(null);
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);

      const response =
        await api.post("/uploads", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      setUpload(response.data.upload);

      setStatus({
        uploadId: response.data.upload.id,
        filename: response.data.upload.filename,
        status: response.data.upload.status,
        totalRows: response.data.upload.totalRows,
        processedRows: 0,
        validRows: 0,
        invalidRows: 0,
        duplicates: 0,
        progress: 0,
      });

      setMessage(
        "File uploaded successfully. Ready to process."
      );
    } catch (err: unknown) {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.message
      : undefined;

    setError(
      message || "Failed to upload file."
    );
    } finally {
      setLoading(false);
    }
  }

  async function handleProcess() {
    if (!upload) {
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await api.post(
        `/uploads/${upload.id}/process`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        "Processing completed successfully."
      );

      const response =
        await api.get<UploadStatus>(
          `/uploads/${upload.id}/status`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      setStatus(response.data);
    } catch (err: unknown) {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.message
      : undefined;

    setError(
      message || "Failed to process file."
    );
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateAnalytics() {
    if (!upload) {
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response =
        await api.post(
          `/uploads/${upload.id}/analytics`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      setAnalytics(response.data.analytics);

      setMessage(
        "Analytics generated successfully."
      );
    } catch (err: unknown) {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.message
      : undefined;

    setError(
      message || "Failed to generate analytics."
    );
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadCsv() {
    if (!upload) {
        return;
    }

    try {
        setError("");
        setMessage("");

        const response = await api.get(
            `/uploads/${upload.id}/download`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: "blob",
            }
        );

        const blob = new Blob([response.data], {
            type: "text/csv",
        });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `processed-${upload.filename}`;
        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);

        setMessage("Processed CSV downloaded successfully.");
    } catch (err: unknown) {
        const message = axios.isAxiosError(err)
            ? err.response?.data?.message
            : undefined;

        setError(
            message || "Failed to download processed CSV."
        );
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  }

  return (
    <div className="dashboard">

      {/* Header */}
      <header className="dashboard-header">

        <div>
          <div className="dashboard-brand">
            <div className="dashboard-logo">
              SA
            </div>

            <div>
              <h1>Sales Analytics</h1>
              <p>
                Data processing & business intelligence
              </p>
            </div>
          </div>
        </div>

        <div className="header-user">
          <span>
            Welcome, <strong>{userName}</strong>
          </span>

          <button
            className="logout-small"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>

      </header>

      <main className="dashboard-content">

        {/* Upload section */}
        <section className="dashboard-section">

          <div className="section-heading">
            <div>
              <h2>Upload Sales Data</h2>

              <p>
                Upload a CSV file to process and analyze
                your sales transactions.
              </p>
            </div>
          </div>

          <div className="upload-card">

            <div className="file-input-wrapper">

              <input
                id="sales-file"
                type="file"
                accept=".csv"
                onChange={(event) => {
                  const file =
                    event.target.files?.[0] ?? null;

                  setSelectedFile(file);
                  setError("");
                  setMessage("");
                }}
              />

              <label htmlFor="sales-file">
                Choose CSV File
              </label>

              {selectedFile && (
                <span className="selected-file">
                  {selectedFile.name}
                </span>
              )}

            </div>

            <button
              className="primary-button upload-button"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading
                ? "Uploading..."
                : "Upload CSV"}
            </button>

          </div>

          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

          {message && (
            <div className="dashboard-success">
              {message}
            </div>
          )}

        </section>

        {/* Processing */}
        {upload && status && (
          <section className="dashboard-section">

            <div className="section-heading">
              <div>
                <h2>Processing</h2>

                <p>
                  {status.filename}
                </p>
              </div>

              <span
                className={`status-badge ${status.status.toLowerCase()}`}
              >
                {status.status}
              </span>
            </div>

            <div className="progress-card">

              <div className="progress-header">
                <span>
                  {status.processedRows} /{" "}
                  {status.totalRows} rows processed
                </span>

                <strong>
                  {status.progress}%
                </strong>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${status.progress}%`,
                  }}
                />
              </div>

              <div className="processing-stats">

                <div>
                  <strong>
                    {status.totalRows}
                  </strong>
                  <span>Total Rows</span>
                </div>

                <div>
                  <strong>
                    {status.processedRows}
                  </strong>
                  <span>Processed</span>
                </div>

                <div>
                  <strong>
                    {status.validRows}
                  </strong>
                  <span>Valid</span>
                </div>

                <div>
                  <strong>
                    {status.invalidRows}
                  </strong>
                  <span>Invalid</span>
                </div>

                <div>
                  <strong>
                    {status.duplicates}
                  </strong>
                  <span>Duplicates</span>
                </div>

              </div>

              <div className="action-buttons">

                {status.status === "PENDING" && (
                    <button
                        className="primary-button"
                        onClick={handleProcess}
                        disabled={loading}
                    >
                        {loading
                            ? "Processing..."
                            : "Start Processing"}
                    </button>
                )}

                {status.status === "COMPLETED" && (
                    <>
                        <button
                            className="primary-button"
                            onClick={handleGenerateAnalytics}
                            disabled={loading}
                        >
                            {loading
                                ? "Generating..."
                                : "Generate Analytics"}
                        </button>

                        <button
                            className="secondary-button"
                            onClick={handleDownloadCsv}
                            disabled={loading}
                        >
                            ⬇ Download Processed CSV
                        </button>
                    </>
                )}

            </div>

            </div>

          </section>
        )}

        {/* Analytics */}
        {analytics && (
          <>
            <section className="dashboard-section">

              <div className="section-heading">
                <div>
                  <h2>Analytics Overview</h2>

                  <p>
                    Key performance indicators for your
                    uploaded sales data.
                  </p>
                </div>
              </div>

              <div className="metrics-grid">

                <div className="metric-card">
                  <span>Total Revenue</span>
                  <strong>
                    {formatCurrency(
                      analytics.totalRevenue
                    )}
                  </strong>
                </div>

                <div className="metric-card">
                  <span>Average Order Value</span>
                  <strong>
                    {formatCurrency(
                      analytics.averageOrderValue
                    )}
                  </strong>
                </div>

                <div className="metric-card">
                  <span>Median Transaction</span>
                  <strong>
                    {formatCurrency(
                      analytics.medianTransactionValue
                    )}
                  </strong>
                </div>

                <div className="metric-card">
                  <span>Discount Loss</span>
                  <strong>
                    {formatCurrency(
                      analytics.discountLoss
                    )}
                  </strong>
                </div>

                <div className="metric-card">
                  <span>Standard Deviation</span>
                  <strong>
                    {formatCurrency(
                      analytics.standardDeviation
                    )}
                  </strong>
                </div>

              </div>

            </section>

            {/* Region / Category */}
            <section className="dashboard-section">

              <div className="analytics-columns">

                <div className="analytics-card">
                    <h3>Revenue by Region</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                        data={Object.entries(
                            analytics.revenueByRegion
                        ).map(([region, revenue]) => ({
                            region,
                            revenue,
                        }))}
                        >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="region"
                            label={{
                                value: "Region",
                                position: "insideBottom",
                                offset: -5,
                            }}
                        />

                        <YAxis
                            label={{
                                value: "Revenue (₹)",
                                angle: -90,
                                position: "insideLeft",
                            }}
                        />
                        <Tooltip
                            formatter={(value) =>
                            formatCurrency(Number(value))
                            }
                        />
                        <Bar
                            dataKey="revenue"
                            fill="#0F766E"
                            radius={[8, 8, 0, 0]}
                        />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="analytics-card">
                    <h3>Revenue by Category</h3>

                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={Object.entries(analytics.revenueByCategory).map(
                                    ([category, revenue]) => ({
                                        category,
                                        revenue,
                                    })
                                )}
                                dataKey="revenue"
                                nameKey="category"
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                            >
                                {Object.entries(analytics.revenueByCategory).map(
                                    ([category], index) => (
                                        <Cell
                                            key={category}
                                            fill={
                                                CATEGORY_COLORS[
                                                    index % CATEGORY_COLORS.length
                                                ]
                                            }
                                        />
                                    )
                                )}
                            </Pie>

                            <Tooltip
                                formatter={(value) =>
                                    formatCurrency(Number(value))
                                }
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="category-legend">
                        {Object.entries(analytics.revenueByCategory).map(
                            ([category], index) => (
                                <div
                                    className="legend-item"
                                    key={category}
                                >
                                    <span
                                        className="legend-color"
                                        style={{
                                            backgroundColor:
                                                CATEGORY_COLORS[
                                                    index %
                                                    CATEGORY_COLORS.length
                                                ],
                                        }}
                                    />
                                    <span>{category}</span>
                                </div>
                            )
                        )}
                    </div>
                    </div>

              </div>

            </section>

            {/* Top 5 */}
            <section className="dashboard-section">

                <div className="analytics-card">

                    <h3>Daily Revenue Trend</h3>

                    <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                        data={Object.entries(
                        analytics.dailyRevenue
                        ).map(([date, revenue]) => ({
                        date,
                        revenue,
                        }))}
                    >
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                            dataKey="date"
                            label={{
                                value: "Transaction Date",
                                position: "insideBottom",
                                offset: -5,
                            }}
                        />

                        <YAxis
                            label={{
                                value: "Revenue (₹)",
                                angle: -90,
                                position: "insideLeft",
                            }}
                        />

                        <Tooltip
                        formatter={(value) =>
                            formatCurrency(Number(value))
                        }
                        />

                        <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#e11212"
                        strokeWidth={4}
                        dot={{
                            r: 5,
                            fill: "#e11212",
                        }}
                        activeDot={{
                            r: 7,
                        }}
                        />
                    </LineChart>
                    </ResponsiveContainer>

                </div>

                </section>

            {/* Daily Revenue */}
            <section className="dashboard-section">

              <div className="analytics-card">

                <h3>Daily Revenue</h3>

                {Object.entries(
                  analytics.dailyRevenue
                ).map(
                  ([date, revenue]) => (
                    <div
                      className="data-row"
                      key={date}
                    >
                      <span>{date}</span>

                      <strong>
                        {formatCurrency(
                          revenue
                        )}
                      </strong>
                    </div>
                  )
                )}

              </div>

            </section>
          </>
        )}

      </main>

    </div>
  );
}

export default Dashboard;