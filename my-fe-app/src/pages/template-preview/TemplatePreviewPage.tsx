import { Box, Button, Container, Group, Text } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getTemplate } from '../../templates/registry';
import { SAMPLE_DATA } from '../../templates/sampleData';

export function TemplatePreviewPage() {
  const { slug = '' } = useParams();
  const template = getTemplate(slug);

  if (!template) return <Navigate to="/mau-thiep" replace />;

  // Mẫu có trang demo riêng toàn màn hình thì chuyển thẳng sang trang đó, không bọc trong khung preview
  if (template.DemoPage) return <Navigate to={`/mau-thiep/${slug}/demo`} replace />;

  const { meta, Component } = template;

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="lg">
        <Button component={Link} to="/mau-thiep" variant="subtle" leftSection={<IconArrowLeft size={16} />}>
          Quay lại
        </Button>
        <Button color="pink" radius="md">
          Dùng mẫu này
        </Button>
      </Group>

      <Text fw={600} ta="center" mb="md">
        {meta.name} · {meta.style}
      </Text>

      <Box
        mx="auto"
        maw={390}
        style={{ borderRadius: 24, overflow: 'hidden', background: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}
      >
        <Component data={SAMPLE_DATA} />
      </Box>
    </Container>
  );
}