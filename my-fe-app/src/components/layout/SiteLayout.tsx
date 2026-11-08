import { ActionIcon, AppShell, Button, Group, Text, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { Link, Outlet } from 'react-router-dom';

export function SiteLayout() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme('light');
  const isDark = computed === 'dark';

  return (
    <AppShell header={{ height: 64 }}>
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Link to="/mau-thiep" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--mantine-color-pink-6)' }} />
            <Text fw={800} fz={20} c="dark.7" style={{ fontFamily: 'cursive' }}>
              Chung Đôi
            </Text>
          </Link>

          <Text c="pink.6" fw={600} visibleFrom="sm">
            Mẫu Thiệp
          </Text>

          <Group gap="sm" wrap="nowrap">
            <ActionIcon
              variant="subtle"
              size="lg"
              aria-label="Đổi giao diện sáng/tối"
              onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
            >
              {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>
            <Button color="pink" radius="md">
              Đăng Nhập
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
