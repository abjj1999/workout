import { Text } from "react-native";

import { Card, Screen } from "@/components/ui";

export default function ExercisesScreen() {
  return (
    <Screen>
      <Text className="font-display text-title uppercase text-text-primary">
        Exercises
      </Text>
      <Card className="mt-4">
        <Text className="font-body text-body text-text-secondary">
          The exercise library will show up here.
        </Text>
      </Card>
    </Screen>
  );
}
