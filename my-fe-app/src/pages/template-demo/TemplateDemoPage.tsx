import { Button, Group } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getTemplate } from '../../templates/registry';
import { SAMPLE_DATA } from '../../templates/sampleData';

/**
 * Trang demo toàn màn hình, nằm ngoài SiteLayout nên không có header của site.
 * Mẫu có DemoPage riêng thì dùng trang đó, còn không thì render Component với dữ liệu mẫu.
 */
export function TemplateDemoPage() {
  const { slug = '' } = useParams();
  const template = getTemplate(slug);

  if (!template) return <Navigate to="/mau-thiep" replace />;

  const { Component, DemoPage } = template;

  // Mẫu có trang riêng: render thẳng, không bọc thêm gì (full 100%, không nút, không wrapper)
  if (DemoPage) return <DemoPage />;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <Group style={{ position: 'fixed', top: 12, left: 12, zIndex: 100 }}>
        <Button
          component={Link}
          to="/mau-thiep"
          variant="filled"
          color="dark"
          radius="xl"
          size="xs"
          leftSection={<IconArrowLeft size={14} />}
        >
          Quay lại
        </Button>
      </Group>

      <Component data={SAMPLE_DATA} />
    </div>
  );
}