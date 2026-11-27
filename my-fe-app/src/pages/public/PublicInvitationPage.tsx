import { Alert, Container, Skeleton, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import dragonPhoenixRed from '../../designs/catalog/dragon-phoenix-red';
import type { SampleData, TemplateModule } from '../../designs/types';
import { toSampleData } from '../../features/public/toSampleData';
import { useCallApi } from '../../hooks/useCallApi';
import { ApiError, getErrorMessage } from '../../services/http';
import { NotFoundPage } from '../exception/NotFoundPage';
import type { RecipientSide } from '../../services/invitation.service';
import { publicService, type PublicInvitationDto } from '../../services/public.service';

// Mẫu đã có giao diện khách. Thêm mẫu mới: thêm một dòng vào đây.
const TEMPLATE_VIEWS: Record<string, TemplateModule['Component']> = {
  dragon_phoenix_red: dragonPhoenixRed.Component,
};

// Khai báo ngoài component để hàm không đổi giữa các lần render
const fetchPublic = (signal: AbortSignal, slug: string, side: RecipientSide | undefined): Promise<PublicInvitationDto> =>
  publicService.get(slug, side, signal).then((r) => r.data);

function sideFrom(value: string | null): RecipientSide | undefined {
  return value === 'groom' || value === 'bride' ? value : undefined;
}

export function PublicInvitationPage() {
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const side = sideFrom(searchParams.get('side'));

  const call = useCallApi(fetchPublic);
  const { run } = call;

  useEffect(() => {
    if (slug) void run(slug, side);
  }, [slug, side, run]);

  if (call.error instanceof ApiError && call.error.status === 404) {
    return <NotFoundPage />;
  }

  if (call.error) {
    return (
      <Container size="sm" py="xl">
        <Alert color="red" title="Không mở được thiệp">
          {getErrorMessage(call.error)}
        </Alert>
      </Container>
    );
  }

  if (!call.data) {
    return (
      <Container size="sm" py="xl">
        <Skeleton h={480} radius="md" />
      </Container>
    );
  }

  const View = TEMPLATE_VIEWS[call.data.template_key];
  if (!View) {
    return (
      <Container size="sm" py="xl">
        <Text c="dimmed">Mẫu này chưa có trang dành cho khách.</Text>
      </Container>
    );
  }

  const data: SampleData = toSampleData(call.data);
  return <View data={data} />;
}