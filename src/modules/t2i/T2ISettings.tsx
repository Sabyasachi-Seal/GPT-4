import * as React from 'react';

import { Alert } from '@mui/joy';

import { FormChipControl } from '~/common/components/forms/FormChipControl';
import { FormRadioOption } from '~/common/components/forms/FormRadioControl';
import { useCapabilityTextToImage } from '~/common/components/useCapabilities';


export function T2ISettings() {

  // external state
  const {
    mayWork,
    providers,
    activeProviderId,
    setActiveProviderId,
  } = useCapabilityTextToImage();


  // derived state
  const providerOptions = React.useMemo(() => {
    const options: FormRadioOption<string>[] = [];
    providers.forEach(provider => {
      options.push({
        label: provider.label,
        value: provider.providerId,
        disabled: !provider.configured,
      });
    });
    return options.toReversed();
  }, [providers]);


  return <>

    {!mayWork ? (

      <Alert variant='soft'>
        There are no configured services for text-to-image generation.
        Please configure one service, such as an OpenAI LLM service, below.
      </Alert>

    ) : (

      <FormChipControl
        title='Text-to-Image'
        description='Active Service'
        // tooltip='Select the service to use for text-to-image generation.'
        disabled={!mayWork}
        options={providerOptions}
        value={activeProviderId ?? undefined} onChange={setActiveProviderId}
      />

    )}

  </>;
}