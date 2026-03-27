import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Skeleton,
  Card,
  CardContent,
  Container,
  InputBase,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";

const CARD_MIN_HEIGHT = 380;
const CARD_PADDING = 2;

function SkeletonCard() {
  return (
    <Card
      sx={{
        minHeight: CARD_MIN_HEIGHT,
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        boxShadow: 6,
        bgcolor: "white",
        width: "100%",
      }}
    >
      <CardContent sx={{ p: CARD_PADDING, flex: 1 }}>
        <Skeleton
          variant="rectangular"
          height={30}
          width="70%"
          sx={{ mb: 1 }}
        />
        <Skeleton
          variant="rectangular"
          height={22}
          width="100%"
          sx={{ mb: 0.5 }}
        />
        <Skeleton
          variant="rectangular"
          height={22}
          width="100%"
          sx={{ mb: 2 }}
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: 2,
            rowGap: 1,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <React.Fragment key={i}>
              <Skeleton variant="rectangular" height={18} width="100%" />
              <Skeleton variant="rectangular" height={18} width="100%" />
            </React.Fragment>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Nutrition() {
  const [query, setQuery] = useState("");
  const [nutritionData, setNutritionData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const fetchNutritionData = async () => {
    if (!query.trim()) return;
    const apiKey = "YhNPoHnVl5E7890IgPQ/gg==SG3PDsf01WHFQ72Y";
    const apiUrl = `https://api.api-ninjas.com/v1/nutrition?query=${query}`;
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl, {
        headers: { "X-Api-Key": apiKey, "Content-Type": "application/json" },
      });
      const data = await res.json();
      setNutritionData(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setNutritionData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getLoaderWidth = () => {
    if (isMobile) return "100%";
    if (isTablet) return "70%";
    return "50%";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        px: 2,
        backgroundImage:
          "linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url(https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1980&auto=format&fit=crop)",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant={isMobile ? "h4" : "h3"}
          align="center"
          sx={{
            color: "white",
            fontWeight: 800,
            mb: 4,
            padding: "25px 0 0 0",
            textShadow: "2px 2px 5px rgba(0,0,0,.7)",
          }}
        >
          Nutritional Checker
        </Typography>

        {/* Input */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            mb: 5,
            alignItems: "center",
          }}
        >
          <Paper
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              fetchNutritionData();
            }}
            sx={{
              p: "8px 14px",
              display: "flex",
              alignItems: "center",
              flex: 1,
              borderRadius: 2.5,
              bgcolor: "white",
              boxShadow: 4,
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: "1rem" }}
              placeholder="Type: 1 cup rice, 1kg chicken, 100g yogurt"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Paper>
          <Button
            variant="contained"
            size="large"
            onClick={fetchNutritionData}
            sx={{
              fontWeight: 800,
              px: 4,
              py: 1.8,
              borderRadius: 2.5,
              bgcolor: "#111",
              ":hover": { bgcolor: "#000" },
              boxShadow: 6,
            }}
          >
            ANALYZE
          </Button>
        </Box>

        {/* Loader / Results */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          {isLoading ? (
            <Box sx={{ width: getLoaderWidth() }}>
              <SkeletonCard />
            </Box>
          ) : (
            nutritionData.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  flex: "1 1 300px",
                  maxWidth: "350px",
                  minWidth: "300px",
                }}
              >
                <Card
                  sx={{
                    minHeight: CARD_MIN_HEIGHT,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    boxShadow: 6,
                    bgcolor: "white",
                  }}
                >
                  <CardContent sx={{ p: CARD_PADDING, flex: 1 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      gutterBottom
                      sx={{ textTransform: "capitalize" }}
                    >
                      {item.name}
                    </Typography>
                    <Typography>
                      <strong>Serving Size:</strong> {item.serving_size_g} g
                    </Typography>
                    <Typography>
                      <strong>Calories:</strong> {item.calories}
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        columnGap: 2,
                        rowGap: 1,
                        mt: 1,
                      }}
                    >
                      <Typography>
                        <strong>Protein:</strong>
                      </Typography>
                      <Typography>{item.protein_g} g</Typography>
                      <Typography>
                        <strong>Carbs:</strong>
                      </Typography>
                      <Typography>{item.carbohydrates_total_g} g</Typography>
                      <Typography>
                        <strong>Fats:</strong>
                      </Typography>
                      <Typography>{item.fat_total_g} g</Typography>
                      <Typography>
                        <strong>Fiber:</strong>
                      </Typography>
                      <Typography>{item.fiber_g} g</Typography>
                      <Typography>
                        <strong>Sugar:</strong>
                      </Typography>
                      <Typography>{item.sugar_g} g</Typography>
                      <Typography>
                        <strong>Cholesterol:</strong>
                      </Typography>
                      <Typography>{item.cholesterol_mg} mg</Typography>
                      <Typography>
                        <strong>Sodium:</strong>
                      </Typography>
                      <Typography>{item.sodium_mg} mg</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))
          )}
        </Box>
        {!isLoading && nutritionData.length === 0 && (
          <Typography
            variant="h6"
            align="center"
            color="white"
            sx={{ mt: 8, textShadow: "1px 1px 4px rgba(0,0,0,.6)" }}
          >
            Start typing a meal to know its nutritional power
          </Typography>
        )}
      </Container>
    </Box>
  );
}
