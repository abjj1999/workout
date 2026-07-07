import { Text } from "react-native";

import { Card, ListRow, Screen } from "@/components/ui";
import { useAuth } from "@/lib/auth/useAuth";

export default function ProfileScreen() {
  const { user } = useAuth();

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
    </Screen>
  );
}
