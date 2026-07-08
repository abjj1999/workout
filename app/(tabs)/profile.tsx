import { Text } from "react-native";

import { Button, Card, ListRow, Screen } from "@/components/ui";
import { useAuth } from "@/lib/auth/useAuth";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

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
      <Button
        variant="ghost"
        label="Sign Out"
        onPress={() => signOut()}
        className="mt-6"
      />
    </Screen>
  );
}
