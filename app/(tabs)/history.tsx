import { Text } from "react-native";

import { Card, Screen } from "@/components/ui";

export default function HistoryScreen() {
  return (
    <Screen>
      <Text className="font-display text-title uppercase text-text-primary">
        History
      </Text>
      <Card className="mt-4">
        <Text className="font-body text-body text-text-secondary">
          Past workouts will show up here.
        </Text>
      </Card>
    </Screen>
  );
}
