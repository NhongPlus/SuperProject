import { AspectRatio, Badge, Box, Card, Container, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { TemplateModal } from '../../components/template/TemplateModal';
import { templates } from '../../templates/registry';
import type { TemplateBadge, TemplateMeta, TemplateModule } from '../../templates/types';

const BADGE_STYLE: Record<TemplateBadge, { label: string; color: string }> = {
  hot: { label: 'Hot', color: 'grape' },
  new: { label: 'Mới', color: 'pink' },
};

function TemplateCard({ meta, onOpen }: { meta: TemplateMeta; onOpen: () => void }) {
  return (
    <Card
      padding={0}
      radius="md"
      shadow="sm"
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      aria-label={`Xem mẫu ${meta.name}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      {meta.badges?.map((b) => (
        <Badge
          key={b}
          color={BADGE_STYLE[b].color}
          size="sm"
          style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
        >
          {BADGE_STYLE[b].label}
        </Badge>
      ))}

      <AspectRatio ratio={9 / 16}>
        <Box
          style={{
            background: `linear-gradient(160deg, ${meta.preview.from}, ${meta.preview.to})`,
            color: meta.preview.accent,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <Text fz="xs" tt="uppercase" lts={3}>
            Welcome to our wedding
          </Text>
          <Text fz="xl" fw={600} ta="center" mt="md" style={{ fontFamily: 'Georgia, serif' }}>
            {meta.name}
          </Text>
        </Box>
      </AspectRatio>
    </Card>
  );
}

export function TemplatesPage() {
  // Giữ template đang chọn tách khỏi trạng thái mở, để nội dung modal không biến mất lúc đang đóng
  const [active, setActive] = useState<TemplateModule | null>(null);
  const [opened, setOpened] = useState(false);

  const openTemplate = (t: TemplateModule) => {
    setActive(t);
    setOpened(true);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap={4} align="center" mb="xl">
        <Title order={2} ta="center">
          Mẫu thiệp mời đám cưới
        </Title>
        <Text c="dimmed" ta="center">
          Tạo miễn phí · Thử 3 ngày · Đẹp mới thanh toán
        </Text>
        <Text c="dimmed" fz="sm" ta="center">
          Bạn có thể đổi mẫu bất cứ lúc nào khi chỉnh sửa
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing="lg">
        {templates.map((t) => (
          <TemplateCard key={t.meta.slug} meta={t.meta} onOpen={() => openTemplate(t)} />
        ))}
      </SimpleGrid>

      <TemplateModal opened={opened} template={active} onClose={() => setOpened(false)} />
    </Container>
  );
}
