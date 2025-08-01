import * as React from 'react';

import type { SxProps } from '@mui/joy/styles/types';
import { Box, Button, Card, CardContent } from '@mui/joy';
import ConstructionIcon from '@mui/icons-material/Construction';

import { DallESettings } from '~/modules/t2i/dalle/DallESettings';

import type { TextToImageProvider } from '~/common/components/useCapabilities';
import { ExpanderControlledBox } from '~/common/components/ExpanderControlledBox';

import { DrawProviderSelector } from './DrawProviderSelector';


export function DrawProviderConfigure(props: {
  providers: TextToImageProvider[],
  activeProviderId: string | null,
  setActiveProviderId: (providerId: (string | null)) => void,
  sx?: SxProps,
}) {

  // state
  const [_open, setOpen] = React.useState(false);


  // derived state

  const { activeProviderId, providers } = props;

  const { ProviderConfig } = React.useMemo(() => {
    const provider = providers.find(provider => provider.providerId === activeProviderId);
    const ProviderConfig: React.FC | null = provider?.vendor === 'openai' ? DallESettings : null;
    return {
      ProviderConfig,
    };
  }, [activeProviderId, providers]);

  const open = _open && !!ProviderConfig;


  const handleToggleOpen = React.useCallback(() => {
    setOpen(on => !on);
  }, []);


  return (

    <Box
      sx={{
        flex: 0,
        display: 'grid',
        ...props.sx,
      }}
    >

      {/* Service-Specific Configuration */}
      <ExpanderControlledBox expanded={open}>
        {!!ProviderConfig && (
          <Card variant='outlined' sx={{ mb: 1, borderTopColor: 'primary.softActiveBg' }}>
            <CardContent sx={{ gap: 1.5 /* keep in sync with SettingsModal > AccordionDetails > Box */ }}>
              <ProviderConfig />
            </CardContent>
          </Card>
        )}
      </ExpanderControlledBox>

      {/* Service / Options Button */}
      <Box sx={{ display: 'flex', flexFlow: 'row wrap', gap: 1 }}>

        <DrawProviderSelector
          title='AI Service:'
          variant='outlined'
          providers={props.providers}
          activeProviderId={props.activeProviderId}
          setActiveProviderId={props.setActiveProviderId}
        />

        <Button
          variant={open ? 'solid' : 'outlined'}
          color={open ? 'neutral' : 'neutral'}
          endDecorator={<ConstructionIcon />}
          onClick={handleToggleOpen}
          sx={{ backgroundColor: open ? undefined : 'background.surface' }}
        >
          Options
        </Button>
      </Box>

    </Box>

  );
}