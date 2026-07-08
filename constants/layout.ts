/** Height of the floating tab bar pill (h-16). */
export const TAB_BAR_HEIGHT = 64;

/** Gap between the tab bar and the screen edges / safe area. */
export const TAB_BAR_MARGIN = 16;

/**
 * Bottom padding scroll content needs, on top of the bottom safe-area
 * inset, so the last element clears the floating tab bar plus breathing
 * room. Screens add the device inset at runtime.
 */
export const TAB_BAR_CLEARANCE =
  TAB_BAR_HEIGHT + TAB_BAR_MARGIN + TAB_BAR_MARGIN;
