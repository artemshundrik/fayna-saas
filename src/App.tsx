// src/App.tsx
import {
  AppShell,
  Box,
  Container,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Title,
} from "@mantine/core";
import { useEffect, useRef } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { AdminPage } from "./pages/AdminPage";
import { PlayersAdminPage } from "./pages/PlayersAdminPage";
import { MatchEventsAdminPage } from "./pages/MatchEventsAdminPage";
import { TournamentsAdminPage } from "./pages/TournamentsAdminPage";
import { StatsPage } from "./pages/StatsPage";
import { PlayerPage } from "./pages/PlayerPage";
import { MatchDetailsPage } from "./pages/MatchDetailsPage";
import { TrainingsListPage } from "./pages/AdminTrainings/TrainingsListPage";
import { TrainingCreatePage } from "./pages/AdminTrainings/TrainingCreatePage";
import { TrainingDetailPage } from "./pages/AdminTrainings/TrainingDetailPage";
import { TrainingsAnalyticsPage } from "./pages/AdminTrainings/TrainingsAnalyticsPage";

import { DesignSystemPage } from "./pages/DesignSystemPage";
import { MatchesShadcnPage } from "@/pages/MatchesShadcnPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import { AppLayout } from "@/layout/AppLayout";
import { CreateMatchPage } from "./pages/CreateMatchPage";
import { OverviewPage } from "./pages/OverviewPage";
import { TournamentDetailsPage } from "./pages/TournamentDetailsPage";

// Стара навігація (Mantine) - можна лишити для legacy
const navLinks = [
  { label: "Тренування (legacy)", to: "/admin/trainings" },
  { label: "Гравці (legacy)", to: "/admin/players" },
  { label: "Турніри (legacy)", to: "/admin/tournaments" },
  { label: "Аналітика (legacy)", to: "/analytics" },
];

function ShellLayout() {
  const location = useLocation();
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: 0,
        behavior: "instant" as ScrollBehavior,
      });
    }
  }, [location.pathname]);

  return (
    <AppShell
      padding="lg"
      navbar={{ width: 220, breakpoint: "sm" }}
      header={{ height: 72 }}
      styles={(theme) => ({
        main: {
          minHeight: "100vh",
          background:
            (theme as any).colorScheme === "dark"
              ? "linear-gradient(135deg, #0f1115 0%, #0b0d12 50%, #0f1115 100%)"
              : "linear-gradient(135deg, #f7f9fc 0%, #eef1f6 50%, #f7f9fc 100%)",
        },
      })}
    >
      <AppShell.Header px="md" withBorder>
        <Group justify="space-between" h="100%">
          <Title order={3} fw={800}>
            FAYNA SaaS (Legacy)
          </Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              component={Link}
              to={item.to}
              label={item.label}
              active={location.pathname === item.to}
              variant="light"
            />
          ))}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <ScrollArea
          h="calc(100vh - 72px)"
          type="scroll"
          style={{ background: "transparent" }}
          viewportRef={viewportRef}
        >
          <Container size="xl" py="md">
            <Box>
              <Routes>
                <Route path="/" element={<Navigate to="/overview" replace />} />
                <Route path="/analytics" element={<Navigate to="/analytics/players" replace />} />
                
                

                {/* legacy */}
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/players" element={<PlayersAdminPage />} />
                <Route path="/admin/tournaments" element={<TournamentsAdminPage />} />
                <Route path="/admin/trainings" element={<TrainingsListPage />} />
                <Route path="/admin/trainings/create" element={<TrainingCreatePage />} />
                <Route path="/admin/trainings/:id" element={<TrainingDetailPage />} />
                <Route path="/admin/trainings/analytics" element={<TrainingsAnalyticsPage />} />
                
             
              </Routes>
            </Box>
          </Container>
        </ScrollArea>
      </AppShell.Main>
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === НОВИЙ LAYOUT (Shadcn UI) === */}

        {/* Overview */}
        <Route
          path="/overview"
          element={
            <AppLayout>
              <OverviewPage />
            </AppLayout>
          }
        />

        {/* Матчі */}
        <Route
          path="/matches-shadcn"
          element={
            <AppLayout>
              <MatchesShadcnPage />
            </AppLayout>
          }
        />

        {/* Деталі матчу */}
        <Route
          path="/matches/:matchId"
          element={
            <AppLayout>
              <MatchDetailsPage />
            </AppLayout>
          }
        />

        {/* Події матчу */}
        <Route
          path="/matches/:matchId/events"
          element={
            <AppLayout>
              <MatchEventsAdminPage />
            </AppLayout>
          }
        />

        {/* Створення матчу */}
        <Route
          path="/matches/new"
          element={
            <AppLayout>
              <CreateMatchPage />
            </AppLayout>
          }
        />

        {/* Admin pages in new layout (щоб не стрибало) */}
        <Route
          path="/admin/trainings"
          element={
            <AppLayout>
              <TrainingsListPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/trainings/create"
          element={
            <AppLayout>
              <TrainingCreatePage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/trainings/:id"
          element={
            <AppLayout>
              <TrainingDetailPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/trainings/analytics"
          element={
            <AppLayout>
              <TrainingsAnalyticsPage />
            </AppLayout>
          }
        />

        <Route
          path="/admin/players"
          element={
            <AppLayout>
              <PlayersAdminPage />
            </AppLayout>
          }
        />
        <Route
          path="/player/:playerId"
          element={
            <AppLayout>
              <PlayerPage />
            </AppLayout>
          }
        />
        <Route
          path="/admin/tournaments"
          element={
            <AppLayout>
              <TournamentsAdminPage />
            </AppLayout>
          }
        />

        {/* Analytics in new layout */}
        <Route
  path="/analytics/players"
  element={
    <AppLayout>
      <StatsPage />
    </AppLayout>
  }
/>
        <Route
  path="/analytics/team"
  element={
    <AppLayout>
      <StatsPage />
    </AppLayout>
  }
/>

        {/* Dev-only pages still work */}
        <Route
          path="/design-system"
          element={
            <AppLayout>
              <DesignSystemPage />
            </AppLayout>
          }
        />
        <Route
          path="/playground"
          element={
            <AppLayout>
              <PlaygroundPage />
            </AppLayout>
          }
        />
<Route
  path="/admin/tournaments/:id"
  element={
    <AppLayout>
      <TournamentDetailsPage />
    </AppLayout>
  }
/>


        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/overview" replace />} />

        {/* === СТАРИЙ LAYOUT (Mantine) === */}
        <Route path="/*" element={<ShellLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
