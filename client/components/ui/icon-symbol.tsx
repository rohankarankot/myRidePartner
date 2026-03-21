// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Partial<Record<string, ComponentProps<typeof MaterialIcons>['name'] | ComponentProps<typeof MaterialCommunityIcons>['name']>>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'magnifyingglass': 'search',
  'plus.circle.fill': 'add-circle',
  'list.bullet': 'list',
  'person.fill': 'person',
  'gearshape.fill': 'settings',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'calendar': 'event',
  'clock.fill': 'access-time',
  'indianrupeesign.circle.fill': 'currency-rupee',
  'xmark': 'close',
  'mappin.circle.fill': 'location-pin',
  'location.fill': 'my-location',
  'person.2.fill': 'group',
  'exclamationmark.triangle.fill': 'warning',
  'exclamationmark.triangle': 'warning-amber',
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',
  'info.circle.fill': 'info',
  'location.slash.fill': 'location-off',
  'slider.horizontal.3': 'tune',
  'bell.fill': 'notifications',
  'car': 'directions-car',
  'car.fill': 'directions-car',
  'google.logo': 'login',
  'checkmark.circle': 'check-circle-outline',
  'camera.fill': 'photo-camera',
  'person.crop.circle.badge.exclamationmark': 'error-outline',
  'exclamationmark.circle.fill': 'error',
  // Profile screen icons
  'star.fill': 'star',
  'star': 'star-outline',
  'flag.checkered': 'flag',
  'at': 'alternate-email',
  'phone.fill': 'phone',
  'envelope.fill': 'email',
  'pencil': 'edit',
  'rectangle.portrait.and.arrow.right': 'logout',
  'xmark.circle.fill': 'cancel',
  'person.2.slash.fill': 'group-off',
  'plus': 'add',
  'minus': 'remove',
  'bubble.left.and.bubble.right.fill': 'forum',
  'steeringwheel': 'drive-eta',
  'github': 'code',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `names are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  if (name === 'github') {
    return <MaterialCommunityIcons color={color} size={size} name="github" style={style} />;
  }
  return <MaterialIcons color={color} size={size} name={MAPPING[name] as any} style={style} />;
}
