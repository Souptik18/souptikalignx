import React, { useState, useMemo, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Skeleton,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Divider,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { keyframes } from "@mui/system";
import { db, auth } from "../../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

/* ---------- Config ---------- */
const YEARS = [2025, 2024, 2023];
const CARD_W = 450;
const IMG_H = 440;

/* unique seed + version for cache-busting */
const IMG = (seed, ver) => `https://picsum.photos/seed/${seed}-${ver}/640/480`;

/* ---------- Utils ---------- */
const spin = keyframes`
  0% { transform: rotate3d(0,0,1,0deg); }
  100% { transform: rotate3d(0,0,1,360deg); }
`;

const generateCardData = (year, ver) =>
  Array.from({ length: 12 }, (_, i) => ({
    id: `${year}-${i}`,
    title: `Month ${i + 1}`,
    date: `${year}-${String(i + 1).padStart(2, "0")}-01`,
    img: IMG(`${year}-${i}`, ver),
  }));

/* ---------- Backgrounds ---------- */
const GradientOverlay = () => (
  <Box
    sx={{
      position: "fixed",
      inset: 0,
      background:
        "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #2d2d2d 50%, #1f1f1f 75%, #141414 100%)",
      zIndex: -2,
    }}
  />
);

const BackgroundPattern = () => (
  <Box
    sx={{
      position: "fixed",
      inset: 0,
      width: "100vw",
      height: "100vh",
      backgroundImage:
        "linear-gradient(rgba(100,150,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(100,150,255,0.06) 1px, transparent 1px)",
      backgroundSize: "50px 50px",
      pointerEvents: "none",
      zIndex: -1,
    }}
  />
);

/* ---------- KPI Card ---------- */
const KPI = ({ loading, title, value, sub }) => (
  <Card
    elevation={0}
    sx={{
      bgcolor: "#121212",
      border: "1px solid #2a2a2a",
      color: "white",
      borderRadius: 2,
      p: 2.5,
      height: 140,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      overflow: "hidden",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 25px rgba(74,144,226,0.15)",
        borderColor: "#4a90e2",
      },
    }}
  >
    {loading ? (
      <>
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width={90} height={18} sx={{ mb: 1.5 }} />
          <Skeleton variant="text" width={120} height={36} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={160} height={20} />
        </Box>
      </>
    ) : (
      <>
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            sx={{
              color: "#9aa4b2",
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 32,
              lineHeight: 1.1,
              mt: 1,
              color: "#ffffff",
            }}
          >
            {value}
          </Typography>
          {sub && (
            <Typography sx={{ color: "#8b949e", fontSize: 14, mt: 1 }}>
              {sub}
            </Typography>
          )}
        </Box>
      </>
    )}
  </Card>
);

KPI.propTypes = {
  loading: PropTypes.bool,
  title: PropTypes.string.isRequired,
  value: PropTypes.node,
  sub: PropTypes.node,
};

/* ---------- Gallery Card ---------- */
const ProgressCard = React.memo(function ProgressCard({
  item,
  index,
  status,
  onLoadOK,
  onLoadErr,
}) {
  const isLoading = status === "loading";
  const isLoaded = status === "loaded";
  const isError = status === "error";

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: CARD_W,
        height: IMG_H + 100,
        bgcolor: "#1a1a1a",
        borderRadius: "12px",
        color: "white",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <Box sx={{ position: "relative", width: "100%", height: IMG_H }}>
        <CardMedia
          component="img"
          image={item.img}
          alt={item.title}
          onLoad={() => onLoadOK(index)}
          onError={() => onLoadErr(index)}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "12px 12px 0 0",
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 240ms ease",
          }}
        />
        {isLoading && (
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{
              borderRadius: "12px 12px 0 0",
              position: "absolute",
              inset: 0,
            }}
          />
        )}
        {isError && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "#2d3748",
              borderRadius: "12px 12px 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" sx={{ color: "#8b949e" }}>
              📸 Image unavailable
            </Typography>
          </Box>
        )}
      </Box>

      <CardContent sx={{ py: 1.5 }}>
        <Typography fontWeight={700}>{item.title}</Typography>
        <Typography sx={{ color: "#8b949e" }}>{item.date}</Typography>
      </CardContent>
    </Card>
  );
});

/* ---------- Page ---------- */
export default function YearlyProgressGallery() {
  const [year, setYear] = useState(YEARS[0]);
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(() => generateCardData(YEARS[0], 0));
  const [imgStatus, setImgStatus] = useState(() => Array(12).fill("loading"));
  const [summaryLoading, setSummaryLoading] = useState(true);

  // New KPIs
  const [bmi, setBmi] = useState("N/A");
  const [weight, setWeight] = useState("N/A");
  const [goal, setGoal] = useState("N/A");
  const [type, setType] = useState("N/A");

  // 🔥 Fetch Firestore onboarding data
  useEffect(() => {
    const fetchProfile = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const ref = doc(db, "users", user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const profile = snap.data().profileData?.profile_summary;
            setBmi(profile?.BMI || "N/A");
            setWeight(profile?.Weight || "N/A");
            setGoal(profile?.Fitness_Goal || "N/A");
            setType(profile?.Fitness_Type || "N/A");
          }
          setSummaryLoading(false);
        } else {
          setSummaryLoading(false);
        }
      });
    };
    fetchProfile();
  }, []);

  const onLoadOK = useCallback((idx) => {
    setImgStatus((prev) => {
      if (prev[idx] === "loaded") return prev;
      const next = [...prev];
      next[idx] = "loaded";
      return next;
    });
  }, []);

  const onLoadErr = useCallback((idx) => {
    setImgStatus((prev) => {
      if (prev[idx] === "error") return prev;
      const next = [...prev];
      next[idx] = "error";
      return next;
    });
  }, []);

  const handleRefresh = useCallback(() => setVersion((prev) => prev + 1), []);
  const handleYearChange = useCallback((e) => setYear(e.target.value), []);

  const cards = useMemo(
    () =>
      data.map((item, index) => (
        <ProgressCard
          key={`${item.id}-${version}`}
          item={item}
          index={index}
          status={busy ? "loading" : imgStatus[index]}
          onLoadOK={onLoadOK}
          onLoadErr={onLoadErr}
        />
      )),
    [data, imgStatus, busy, onLoadOK, onLoadErr, version]
  );

  return (
    <Box sx={{ minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <GradientOverlay />
      <BackgroundPattern />

      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          mb: 2,
          position: "sticky",
          top: 0,
          zIndex: 10,
          py: 2,
          px: 4,
          pt: 10,
          background: "rgba(10,10,10,0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            pl: 2,
            color: "white",
            fontWeight: 800,
            fontSize: "2.6rem",
            textTransform: "uppercase",
          }}
        >
          <span className="text-[#ffea31]">Progress</span> {year}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, pr: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="year-select-label" sx={{ color: "white" }}>
              Year
            </InputLabel>
            <Select
              labelId="year-select-label"
              value={year}
              onChange={handleYearChange}
              sx={{
                color: "white",
                border: "1px solid #555",
                ".MuiOutlinedInput-notchedOutline": { borderColor: "#555" },
                ".MuiSvgIcon-root": { color: "white" },
              }}
            >
              {YEARS.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title="Refresh Progress">
            <IconButton
              onClick={handleRefresh}
              sx={{
                color: "white",
                backgroundColor: "#4a90e2",
                "&:hover": {
                  backgroundColor: "#5ba0f2",
                  transform: "scale(1.08)",
                },
                transition: "all 0.3s ease",
                width: 40,
                height: 40,
              }}
            >
              <RefreshIcon
                sx={{ animation: busy ? `${spin} 1s linear infinite` : "none" }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* KPI Strip */}
      <Box
        sx={{
          px: { xs: 2, sm: 3, lg: 4 },
          maxWidth: "1600px",
          mx: "auto",
          mb: 4,
        }}
      >
        <Grid
          container
          spacing={{ xs: 2, sm: 3, lg: 4 }}
          sx={{ justifyContent: "center" }}
        >
          <Grid item xs={12} sm={6} md={3} lg={3}>
            <KPI
              loading={summaryLoading}
              title="BMI"
              value={bmi}
              sub="Healthy range: 18.5–24.9"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3}>
            <KPI
              loading={summaryLoading}
              title="Weight"
              value={`${weight} kg`}
              sub="From AI onboarding"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3}>
            <KPI
              loading={summaryLoading}
              title="Fitness Goal"
              value={goal}
              sub="Your AI-determined target"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={3}>
            <KPI
              loading={summaryLoading}
              title="Fitness Type"
              value={type}
              sub="Focus area"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,.08)" }} />
      </Box>

      {/* Cards Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: "24px",
          pb: 8,
          position: "relative",
          zIndex: 1,
          px: { xs: 2, sm: 3, lg: 4 },
          maxWidth: "1500px",
          mx: "auto",
        }}
      >
        {cards}
      </Box>
    </Box>
  );
}
