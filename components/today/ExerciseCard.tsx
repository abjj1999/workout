import Ionicons from "@expo/vector-icons/Ionicons";
import { Fragment } from "react";
import { Pressable, Text, View } from "react-native";

import { SetRow } from "@/components/today/SetRow";
import { Card, Chip } from "@/components/ui";
import { colors } from "@/constants/colors";
import type { WorkoutSet } from "@/lib/data";
import type { WorkoutSection } from "@/lib/hooks/useWorkoutForDate";

type SetValues = { weight: number; reps: number };

type ExerciseCardProps = {
  section: WorkoutSection;
  editable: boolean;
  editingSetId: string | null;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onAddSet: () => void;
  onRemoveExercise: () => void;
  onRequestEdit: (setId: string) => void;
  onConfirmEdit: (setId: string, values: SetValues) => void;
  onCancelEdit: () => void;
  onToggleCompleted: (set: WorkoutSet) => void;
  onDeleteSet: (set: WorkoutSet) => void;
  watchVideo: () => void;
};

export function ExerciseCard({
  section,
  editable,
  editingSetId,
  menuOpen,
  onToggleMenu,
  onAddSet,
  onRemoveExercise,
  onRequestEdit,
  onConfirmEdit,
  onCancelEdit,
  onToggleCompleted,
  onDeleteSet,
  watchVideo,
}: ExerciseCardProps) {
  const { exercise, sets } = section;
  const name = exercise?.name ?? "Unknown exercise";
  const muscle = exercise?.muscleGroups[0] ?? "other";

  return (
    // Raise the card above its siblings while its menu is open so the
    // popover isn't covered by the next card.
    <Card style={{ zIndex: menuOpen ? 10 : 0 }}>
      <View className="flex-row items-center gap-2">
        <Text
          numberOfLines={1}
          className="flex-shrink font-body-semibold text-body text-text-primary"
        >
          {name}
        </Text>
        <Chip label={muscle} />
        <View className="flex-1" />
        {editable ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Exercise options"
            onPress={onToggleMenu}
            hitSlop={8}
            className="-mr-2 h-12 w-12 items-center justify-center"
          >
            <Ionicons
              name="ellipsis-vertical"
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>

      {menuOpen ? (
        <View className="absolute right-4 top-14 z-10 w-48 overflow-hidden rounded-card border border-border bg-surface-raised">
          <Pressable
            accessibilityRole="button"
            onPress={onAddSet}
            className="h-12 justify-center px-4"
          >
            <Text className="font-body text-body text-text-primary">
              Add Set
            </Text>
          </Pressable>
          <View className="h-px bg-border" />
          <Pressable
            accessibilityRole="button"
            onPress={watchVideo}
            className="h-12 justify-center px-4"
          >
            <Text className="font-body text-body text-text-primary">
              Watch Demo
            </Text>
          </Pressable>
          <View className="h-px bg-border" />
          <Pressable
            accessibilityRole="button"
            onPress={onRemoveExercise}
            className="h-12 justify-center px-4"
          >
            <Text className="font-body text-body text-accent">
              Remove Exercise
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View className="mt-2">
        {sets.map((set, index) => (
          <Fragment key={set.id}>
            {index > 0 ? <View className="h-px bg-border" /> : null}
            <SetRow
              set={set}
              editable={editable}
              isEditing={editingSetId === set.id}
              onRequestEdit={() => onRequestEdit(set.id)}
              onConfirmEdit={(values) => onConfirmEdit(set.id, values)}
              onCancelEdit={onCancelEdit}
              onToggleCompleted={() => onToggleCompleted(set)}
              onDelete={() => onDeleteSet(set)}
            />
          </Fragment>
        ))}
        {sets.length === 0 ? (
          <Text className="py-3 font-body text-body text-text-secondary">
            No sets yet.
          </Text>
        ) : null}
      </View>
    </Card>
  );
}
