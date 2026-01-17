import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MotiView } from 'moti';
import { MotiPressable } from 'moti/interactions';
import Svg, { Path } from 'react-native-svg';

interface NavItem {
  name: string;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

interface BottomNavigationProps {
  activeRoute: string;
  onNavigate: (routeName: string) => void;
}

// Yogilog-styled Icons
const HomeIcon = ({ filled = false, color = '#fff' }: { filled?: boolean; color?: string }) => (
  <Svg
    width={24}
    height={24}
    fill={filled ? color : 'none'}
    viewBox="0 0 24 24"
    stroke={color}
    strokeWidth={filled ? 0 : 2}
  >
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </Svg>
);

const LibraryIcon = ({ filled = false, color = '#fff' }: { filled?: boolean; color?: string }) => (
  <Svg
    width={24}
    height={24}
    fill={filled ? color : 'none'}
    viewBox="0 0 24 24"
    stroke={color}
    strokeWidth={filled ? 0 : 2}
  >
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
    />
  </Svg>
);

const ChartIcon = ({ filled = false, color = '#fff' }: { filled?: boolean; color?: string }) => (
  <Svg
    width={24}
    height={24}
    fill={filled ? color : 'none'}
    viewBox="0 0 24 24"
    stroke={color}
    strokeWidth={filled ? 0 : 2}
  >
    {filled ? (
      <>
        <Path
          fillRule="evenodd"
          d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z"
          clipRule="evenodd"
        />
        <Path
          fillRule="evenodd"
          d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z"
          clipRule="evenodd"
        />
      </>
    ) : (
      <>
        <Path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <Path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
      </>
    )}
  </Svg>
);

const navItems: NavItem[] = [
  {
    name: 'Journal',
    label: 'Home',
    icon: <HomeIcon />,
    activeIcon: <HomeIcon filled color="#A238FF" />,
  },
  {
    name: 'Library',
    label: 'Poses',
    icon: <LibraryIcon />,
    activeIcon: <LibraryIcon filled color="#A238FF" />,
  },
  {
    name: 'Analytics',
    label: 'Stats',
    icon: <ChartIcon />,
    activeIcon: <ChartIcon filled color="#A238FF" />,
  },
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeRoute, onNavigate }) => {
  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        {navItems.map((item) => {
          const isActive = activeRoute === item.name;

          return (
            <MotiPressable
              key={item.name}
              onPress={() => onNavigate(item.name)}
              style={styles.navItem}
            >
              <MotiView
                animate={{
                  scale: isActive ? 1.15 : 1,
                  translateY: isActive ? -4 : 0,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={styles.iconContainer}
              >
                {isActive ? item.activeIcon : item.icon}

                {/* Glow effect for active icon */}
                {isActive && (
                  <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    style={styles.glowEffect}
                  >
                    {item.activeIcon}
                  </MotiView>
                )}
              </MotiView>

              <MotiView
                animate={{
                  opacity: isActive ? 1 : 0.5,
                }}
              >
                <Text
                  style={[
                    styles.navLabel,
                    isActive && styles.navLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </MotiView>

              {/* Active indicator line */}
              {isActive && (
                <MotiView
                  from={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={styles.activeIndicator}
                />
              )}
            </MotiPressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(18, 18, 22, 0.95)',
    paddingBottom: 34, // Safe area for iOS
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    opacity: 0.6,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  navLabelActive: {
    fontWeight: '700',
    color: '#A238FF',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 32,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#A238FF',
  },
});

export default BottomNavigation;
