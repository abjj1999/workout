import { useRouter } from "expo-router";
import { Text } from "react-native";

import { BodyWeightCard } from "@/components/profile/BodyWeightCard";
import { LifetimeStats } from "@/components/profile/LifetimeStats";
import { PersonalRecords } from "@/components/profile/PersonalRecords";
import { SettingsCard } from "@/components/profile/SettingsCard";
import { Button, Card, ListRow, Screen } from "@/components/ui";
import { useAuth } from "@/lib/auth/useAuth";
import { useBodyWeight } from "@/lib/hooks/useBodyWeight";
import { useProfileStats } from "@/lib/hooks/useProfileStats";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { stats, records, loading: statsLoading } = useProfileStats();
  const {
    entries,
    loading: weightLoading,
    log,
  } = useBodyWeight();

  return (
    <Screen>
      <Text className="font-display text-title uppercase text-text-primary">
        Profile
      </Text>
      <Card className="mt-4">
        <ListRow
          title={user?.name ?? "Guest"}
          subtitle={user?.email}
          showChevron
        />
      </Card>

      <LifetimeStats stats={stats} loading={statsLoading} />
      <PersonalRecords records={records} loading={statsLoading} />
      <BodyWeightCard
        entries={entries}
        loading={weightLoading}
        onLog={log}
        onOpenHistory={() => router.push("/body-weight")}
      />
      <SettingsCard />

      <Button
        variant="ghost"
        label="Sign Out"
        onPress={() => signOut()}
        className="mt-6"
      />
    </Screen>
  );
}
