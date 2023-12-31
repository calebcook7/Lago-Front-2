import { useEffect, memo, useState } from 'react'
import { FormikProps } from 'formik'
import styled from 'styled-components'
import { InputAdornment } from '@mui/material'
import { gql } from '@apollo/client'

import { TextInputField, AmountInputField, ButtonSelectorField } from '~/components/form'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { Button, Chip, Icon, Tooltip, Typography } from '~/components/designSystem'
import { theme, Card, NAV_HEIGHT } from '~/styles'
import { getCurrencySymbol } from '~/core/formats/intlFormatNumber'
import { CurrencyEnum, PlanInterval } from '~/generated/graphql'

import { PlanFormInput } from './types'

gql`
  fragment PlanForFixedFeeSection on Plan {
    id
    amountCents
    payInAdvance
    trialPeriod
  }
`

interface FixedFeeSectionProps {
  canBeEdited: boolean
  formikProps: FormikProps<PlanFormInput>
  isEdition: boolean
}

const mapIntervalCopy = (interval: string) => {
  if (interval === PlanInterval.Monthly) {
    return 'text_624453d52e945301380e49aa'
  }
  if (interval === PlanInterval.Yearly) {
    return 'text_624453d52e945301380e49ac'
  }
  if (interval === PlanInterval.Weekly) {
    return 'text_62b32ec6b0434070791c2d4c'
  }

  return ''
}

export const FixedFeeSection = memo(
  ({ canBeEdited, formikProps, isEdition }: FixedFeeSectionProps) => {
    const { translate } = useInternationalization()
    const [shouldDisplayTrialPeriod, setShouldDisplayTrialPeriod] = useState(false)
    const hasErrorInSection =
      Boolean(formikProps.errors.amountCents) || formikProps.errors.amountCents === ''

    useEffect(() => {
      const initialTrialPeriod = formikProps?.initialValues?.trialPeriod || 0

      setShouldDisplayTrialPeriod(!isNaN(initialTrialPeriod) && initialTrialPeriod > 0)
    }, [formikProps.initialValues.trialPeriod])

    return (
      <Card>
        <SectionTitle variant="subhead">{translate('text_642d5eb2783a2ad10d670332')}</SectionTitle>

        <BoxWrapper>
          <BoxHeader>
            <Typography variant="bodyHl" color="grey700">
              {translate('text_642d5eb2783a2ad10d670336')}
            </Typography>
            <BoxHeaderRight>
              <Tooltip
                placement="top-end"
                title={
                  hasErrorInSection
                    ? translate('text_635b975ecea4296eb76924b7')
                    : translate('text_635b975ecea4296eb76924b1')
                }
              >
                <Icon name="validate-filled" color={hasErrorInSection ? 'disabled' : 'success'} />
              </Tooltip>
              <Chip label={translate(mapIntervalCopy(formikProps.values.interval))} />
            </BoxHeaderRight>
          </BoxHeader>
          <BoxContent>
            <AmountInputField
              name="amountCents"
              currency={formikProps.values.amountCurrency}
              beforeChangeFormatter={['positiveNumber']}
              disabled={isEdition && !canBeEdited}
              label={translate('text_624453d52e945301380e49b6')}
              formikProps={formikProps}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {getCurrencySymbol(formikProps.values.amountCurrency || CurrencyEnum.Usd)}
                  </InputAdornment>
                ),
              }}
            />
            <ButtonSelectorField
              name="payInAdvance"
              label={translate('text_646e2d0cc536351b62ba6f86')}
              formikProps={formikProps}
              disabled={isEdition && !canBeEdited}
              helperText={
                formikProps.values.payInAdvance
                  ? translate('text_646e2d0cc536351b62ba6fc5')
                  : translate('text_646e2d0cc536351b62ba6fb0')
              }
              options={[
                {
                  label: translate('text_646e2d0cc536351b62ba6f8c'),
                  value: false,
                },
                {
                  label: translate('text_646e2d0cc536351b62ba6faa'),
                  value: true,
                },
              ]}
            />

            {shouldDisplayTrialPeriod ? (
              <InlineTrialPeriod>
                <InputTrialPeriod
                  name="trialPeriod"
                  disabled={isEdition && !canBeEdited}
                  label={translate('text_624453d52e945301380e49c2')}
                  beforeChangeFormatter={['positiveNumber', 'int']}
                  placeholder={translate('text_624453d52e945301380e49c4')}
                  formikProps={formikProps}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {translate('text_624453d52e945301380e49c6')}
                      </InputAdornment>
                    ),
                  }}
                />
                <CloseTrialPeriodTooltip
                  placement="top-end"
                  title={translate('text_63aa085d28b8510cd46443ff')}
                  disableHoverListener={isEdition && !canBeEdited}
                >
                  <Button
                    icon="trash"
                    variant="quaternary"
                    disabled={isEdition && !canBeEdited}
                    onClick={() => {
                      formikProps.setFieldValue('trialPeriod', null)
                      setShouldDisplayTrialPeriod(false)
                    }}
                  />
                </CloseTrialPeriodTooltip>
              </InlineTrialPeriod>
            ) : (
              <Button
                startIcon="plus"
                disabled={isEdition && !canBeEdited}
                variant="quaternary"
                data-test="show-trial-period"
                onClick={() => setShouldDisplayTrialPeriod(true)}
              >
                {translate('text_642d5eb2783a2ad10d670344')}
              </Button>
            )}
          </BoxContent>
        </BoxWrapper>
      </Card>
    )
  }
)

FixedFeeSection.displayName = 'FixedFeeSection'

const SectionTitle = styled(Typography)`
  > div:first-child {
    margin-bottom: ${theme.spacing(3)};
  }
`

const InlineTrialPeriod = styled.div`
  display: flex;
  align-items: center;
`

const InputTrialPeriod = styled(TextInputField)`
  flex: 1;
  margin-right: ${theme.spacing(3)};
`

const CloseTrialPeriodTooltip = styled(Tooltip)`
  margin-top: ${theme.spacing(6)};
`

const BoxWrapper = styled.div`
  width: 100%;
  border: 1px solid ${theme.palette.grey[300]};
  border-radius: 12px;
`

const BoxHeader = styled.div`
  height: ${NAV_HEIGHT}px;
  padding: 0 ${theme.spacing(4)};
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${theme.shadows[7]};
`

const BoxHeaderRight = styled.div`
  display: flex;
  align-items: center;

  > *:not(:last-child) {
    margin-right: ${theme.spacing(3)};
  }
`

const BoxContent = styled.div`
  padding: ${theme.spacing(4)};

  > *:not(:last-child) {
    margin-bottom: ${theme.spacing(8)};
  }
`
