import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import { Input, Stepper } from "@/components/ui";
import { colors } from "@/constants/colors";
import type { WorkoutSet } from "@/lib/data";
import { useSettings } from "@/lib/settings/useSettings";
import { toDisplayWeight, toStoredWeight, weightStep } from "@/lib/units";

const REPS_STEP = 1;

type SetValues = { weight: number; reps: number };

type SetRowProps = {
  set: WorkoutSet;
  /** False when viewing a past day or a finished workout. */
  editable: boolean;
  isEditing: boolean;
  onRequestEdit: () => void;
  onConfirmEdit: (values: SetValues) => void;
  onCancelEdit: () => void;
  onToggleCompleted: () => void;
  onDelete: () => void;
};

// Direct numeric entry, swapped in for a Stepper when its value is tapped.
function DirectInput({
  initial,
  onCommit,
}: {
  initial: number;
  onCommit: (value: number | null) => void;
}) {
  const [text, setText] = useState(String(initial));
  const commit = () => {
    const parsed = Number(text);
    onCommit(
      text.trim() !== "" && Number.isFinite(parsed)
        ? Math.max(0, parsed)
        : null,
    );
  };
  return (
    <Input
      value={text}
      onChangeText={setText}
      keyboardType="numeric"
      autoFocus
      selectTextOnFocus
      onBlur={commit}
      onSubmitEditing={commit}
      className="text-center"
    />
  );
}

function SetEditor({
  set,
  onConfirm,
  onCancel,
}: {
  set: WorkoutSet;
  onConfirm: (values: SetValues) => void;
  onCancel: () => void;
}) {
  const unit = useSettings((state) => state.weightUnit);
  // Edit in the display unit; convert back to stored lbs on confirm.
  const [weight, setWeight] = useState(() =>
    toDisplayWeight(set.weight, unit),
  );
  const [reps, setReps] = useState(set.reps);
  const [directField, setDirectField] = useState<"weight" | "reps" | null>(
    null,
  );
  const step = weightStep(unit);

  return (
    <View className="gap-3 py-3">
      <View className="flex-row gap-3">
        <View className="flex-1 gap-2">
          <Text className="font-body-medium text-label uppercase text-text-secondary">
            Weight
          </Text>
          {directField === "weight" ? (
            <DirectInput
              initial={weight}
              onCommit={(value) => {
                if (value !== null) setWeight(value);
                setDirectField(null);
              }}
            />
          ) : (
            <Stepper
              value={weight}
              onDecrement={() => setWeight((w) => Math.max(0, w - step))}
              onIncrement={() => setWeight((w) => w + step)}
              onValuePress={() => setDirectField("weight")}
            />
          )}
        </View>
        <View className="flex-1 gap-2">
          <Text className="font-body-medium text-label uppercase text-text-secondary">
            Reps
          </Text>
          {directField === "reps" ? (
            <DirectInput
              initial={reps}
              onCommit={(value) => {
                if (value !== null) setReps(Math.round(value));
                setDirectField(null);
              }}
            />
          ) : (
            <Stepper
              value={reps}
              onDecrement={() => setReps((r) => Math.max(0, r - REPS_STEP))}
              onIncrement={() => setReps((r) => r + REPS_STEP)}
              onValuePress={() => setDirectField("reps")}
            />
          )}
        </View>
      </View>
      <View className="flex-row justify-end gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel edit"
          onPress={onCancel}
          className="h-12 w-12 items-center justify-center rounded-btn border border-border"
          style={({ pressed }) =>
            pressed ? { transform: [{ scale: 0.98 }] } : undefined
          }
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Confirm edit"
          onPress={() =>
            onConfirm({ weight: toStoredWeight(weight, unit), reps })
          }
          className="h-12 w-12 items-center justify-center rounded-btn bg-accent"
          style={({ pressed }) =>
            pressed ? { transform: [{ scale: 0.98 }] } : undefined
          }
        >
          <Ionicons name="checkmark" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

export function SetRow({
  set,
  editable,
  isEditing,
  onRequestEdit,
  onConfirmEdit,
  onCancelEdit,
  onToggleCompleted,
  onDelete,
}: SetRowProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const unit = useSettings((state) => state.weightUnit);
  const displayWeight = toDisplayWeight(set.weight, unit);

  if (isEditing) {
    return <SetEditor set={set} onConfirm={onConfirmEdit} onCancel={onCancelEdit} />;
  }

  const row = (
    <Pressable
      disabled={!editable}
      onPress={onRequestEdit}
      accessibilityLabel={`Set ${set.setNumber}: ${displayWeight} by ${set.reps}`}
      className="h-14 flex-row items-center gap-3 bg-surface"
    >
      <Text className="w-6 text-center font-display text-label text-text-secondary">
        {set.setNumber}
      </Text>
      <Text className="flex-1 font-display text-body text-text-primary">
        {displayWeight} × {set.reps}
      </Text>
      <Pressable
        disabled={!editable}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: set.completed }}
        accessibilityLabel="Set completed"
        onPress={onToggleCompleted}
        hitSlop={8}
        className="h-12 w-12 items-center justify-center"
      >
        <View
          className={`h-7 w-7 items-center justify-center rounded-full border ${
            set.completed ? "border-accent bg-accent" : "border-border"
          }`}
        >
          {set.completed ? (
            <Ionicons name="checkmark" size={16} color={colors.textPrimary} />
          ) : null}
        </View>
      </Pressable>
    </Pressable>
  );

  if (!editable) {
    return row;
  }

  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={32}
      overshootRight={false}
      onSwipeableClose={() => setConfirmingDelete(false)}
      renderRightActions={() => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={confirmingDelete ? "Confirm delete" : "Delete set"}
          onPress={() => {
            if (confirmingDelete) {
              onDelete();
            } else {
              setConfirmingDelete(true);
            }
          }}
          className={`w-24 items-center justify-center ${
            confirmingDelete ? "bg-accent" : "bg-surface-raised"
          }`}
        >
          <Text
            className={`font-body-semibold text-label uppercase ${
              confirmingDelete ? "text-text-primary" : "text-accent"
            }`}
          >
            {confirmingDelete ? "Confirm" : "Delete"}
          </Text>
        </Pressable>
      )}
    >
      {row}
    </ReanimatedSwipeable>
  );
}
