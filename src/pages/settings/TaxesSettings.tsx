import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { gql } from '@apollo/client'

import { Typography, Button, InfiniteScroll } from '~/components/designSystem'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import ErrorImage from '~/public/images/maneki/error.svg'
import { GenericPlaceholder } from '~/components/GenericPlaceholder'
import { theme, NAV_HEIGHT } from '~/styles'
import {
  EditOrganizationInvoiceTemplateDialogFragmentDoc,
  TaxRateItemFragmentDoc,
  useGetTaxRatesQuery,
} from '~/generated/graphql'
import { CREATE_TAX_RATE_ROUTE } from '~/core/router'
import { TaxRateItem, TaxRateItemSkeleton } from '~/components/taxRates/TaxRateItem'
import {
  DeleteTaxRateDialog,
  DeleteTaxRateDialogRef,
} from '~/components/taxRates/DeleteTaxRateDialog'

gql`
  query getTaxRates($limit: Int, $page: Int) {
    taxRates(limit: $limit, page: $page) {
      metadata {
        currentPage
        totalPages
      }
      collection {
        id
        ...TaxRateItem
      }
    }
  }

  ${TaxRateItemFragmentDoc}
  ${EditOrganizationInvoiceTemplateDialogFragmentDoc}
`

const TaxesSettings = () => {
  const navigate = useNavigate()
  const { translate } = useInternationalization()
  const deleteDialogRef = useRef<DeleteTaxRateDialogRef>(null)
  const { data, error, loading, fetchMore } = useGetTaxRatesQuery({
    variables: { limit: 20 },
    notifyOnNetworkStatusChange: true,
  })
  const { metadata, collection } = data?.taxRates || {}

  if (!!error && !loading) {
    return (
      <GenericPlaceholder
        title={translate('text_629728388c4d2300e2d380d5')}
        subtitle={translate('text_629728388c4d2300e2d380eb')}
        buttonTitle={translate('text_629728388c4d2300e2d38110')}
        buttonVariant="primary"
        buttonAction={() => location.reload()}
        image={<ErrorImage width="136" height="104" />}
      />
    )
  }

  return (
    <>
      <Page>
        <Title variant="headline">{translate('text_645bb193927b375079d28ab5')}</Title>
        <Subtitle>{translate('text_645bb193927b375079d28acc')}</Subtitle>

        <InlineSectionTitle>
          <Typography variant="subhead" color="grey700">
            {translate('text_645bb193927b375079d28ae8')}
          </Typography>
          <Button
            variant="quaternary"
            disabled={loading}
            onClick={() => {
              navigate(CREATE_TAX_RATE_ROUTE)
            }}
          >
            {translate('text_645bb193927b375079d28ad2')}
          </Button>
        </InlineSectionTitle>

        <InfoBlock $hasData={!!collection?.length}>
          {!collection?.length ? (
            <>
              <Typography variant="body" color="grey700">
                {translate('text_645bb193927b375079d28aee')}
              </Typography>
              <Typography variant="caption" color="grey600">
                {translate('text_645ca29272ea80007df9d7af')}
              </Typography>
            </>
          ) : (
            <InfiniteScroll
              onBottom={() => {
                if (!fetchMore) return
                const { currentPage = 0, totalPages = 0 } = metadata || {}

                currentPage < totalPages &&
                  !loading &&
                  fetchMore({
                    variables: { page: currentPage + 1 },
                  })
              }}
            >
              {!!collection &&
                collection.map((tax) => {
                  return (
                    <TaxRateItem
                      key={`tax-rate-item-${tax.id}`}
                      taxRate={tax}
                      deleteDialogRef={deleteDialogRef}
                    />
                  )
                })}
              {loading &&
                [0, 1, 2].map((_, i) => <TaxRateItemSkeleton key={`tax-rate-skeleton-${i}`} />)}
            </InfiniteScroll>
          )}
        </InfoBlock>
      </Page>

      <DeleteTaxRateDialog ref={deleteDialogRef} />
    </>
  )
}

const Page = styled.div`
  max-width: ${theme.spacing(168)};
  padding: ${theme.spacing(8)} ${theme.spacing(12)};
`

const Title = styled(Typography)`
  margin-bottom: ${theme.spacing(2)};
`

const Subtitle = styled(Typography)`
  margin-bottom: ${theme.spacing(8)};
`

const InlineSectionTitle = styled.div`
  height: ${NAV_HEIGHT}px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const InfoBlock = styled.div<{ $hasData?: boolean }>`
  padding-bottom: ${({ $hasData }) => ($hasData ? 0 : theme.spacing(8))};
  box-shadow: ${({ $hasData }) => ($hasData ? 0 : theme.shadows[7])};
`

export default TaxesSettings