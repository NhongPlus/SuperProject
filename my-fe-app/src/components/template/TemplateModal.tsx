import { Badge, Box, Button, Divider, Grid, Group, Modal, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconCheck, IconEye, IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_DATA } from '../../templates/sampleData';
import type { TemplateModule } from '../../templates/types';
import { PlaceholderQr } from './PlaceholderQr';

interface TemplateModalProps {
  opened: boolean;
  template: TemplateModule | null;
  onClose: () => void;
}

export function TemplateModal({ opened, template, onClose }: TemplateModalProps) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 48em)');

  if (!template) return null;

  const { meta, Component } = template;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="60rem"
      radius="lg"
      centered
      fullScreen={isMobile}
      padding="lg"
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
    >
      <Grid gutter="xl">
        {/* Khung xem thiệp, cuộn được */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Box
            mx="auto"
            maw={320}
            h={560}
            style={{
              overflowY: 'auto',
              borderRadius: 16,
              border: '1px solid var(--mantine-color-default-border)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
              background: '#fff',
            }}
          >
            <Component data={SAMPLE_DATA} />
          </Box>
        </Grid.Col>

        {/* Thông tin mẫu */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="md" h="100%">
            <div>
              <Title order={2}>{meta.name}</Title>
              <Text c="dimmed" mt={4}>
                {meta.description}
              </Text>
            </div>

            <Group gap="xs">
              {meta.tags.map((tag) => (
                <Badge key={tag} variant="outline" color="gray" radius="sm">
                  {tag}
                </Badge>
              ))}
            </Group>

            <div>
              <Text fw={600} mb="xs">
                Tính năng
              </Text>
              <SimpleGrid cols={2} spacing="xs">
                {meta.features.map((f) => (
                  <Group key={f} gap="xs" wrap="nowrap">
                    <ThemeIcon size={18} radius="xl" color="pink" variant="light">
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <Text fz="sm">{f}</Text>
                  </Group>
                ))}
              </SimpleGrid>
            </div>

            <Divider />

            <Group align="center" wrap="nowrap" gap="md">
              <PlaceholderQr size={96} />
              <Text fz="sm" c="dimmed">
                Quét mã QR để xem demo trực tiếp trên điện thoại
              </Text>
            </Group>

            <Stack gap={2} mt="auto">
              <Text fz="xs" c="dimmed">
                Tạo miễn phí · Thử 3 ngày · Đẹp mới thanh toán
              </Text>
              <Text fz="xs" c="dimmed">
                Bạn có thể đổi mẫu bất cứ lúc nào khi chỉnh sửa
              </Text>
            </Stack>

            <Group grow>
              <Button
                color="pink"
                radius="md"
                leftSection={<IconPlus size={16} />}
                // TODO: chuyển sang trình tạo thiệp khi có trang editor
                onClick={() => {}}
              >
                Tạo thiệp
              </Button>
              <Button
                variant="outline"
                color="dark"
                radius="md"
                leftSection={<IconEye size={16} />}
                onClick={() => {
                  onClose();
                  navigate(`/mau-thiep/${meta.slug}`);
                }}
              >
                Xem demo
              </Button>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>
    </Modal>
  );
}
