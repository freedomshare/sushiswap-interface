import Button from 'app/components/Button'
import Chip from 'app/components/Chip'
import { formatNumber, formatPercent } from 'app/functions/format'
import { getTridentPools } from 'app/services/graph/fetchers/pools'
import Link from 'next/link'
import React, { useMemo } from 'react'
import useSWR from 'swr'

import { chipPoolColorMapper, poolTypeNameMapper } from '../types'
import { PoolCell } from './PoolCell'
import { feeTiersFilter, filterForSearchQueryAndTWAP } from './poolTableFilters'
import { PoolType } from '@sushiswap/tines'

export const usePoolsTableData = () => {
  const { data, error, isValidating } = useSWR('getAllTridentPools', () => getTridentPools())

  const columns = useMemo(() => {
    return [
      {
        Header: 'Assets',
        accessor: 'symbols',
        Cell: ({ value, row: { original } }) => {
          return <PoolCell symbols={value} currencyIds={original.currencyIds} twapEnabled={original.twapEnabled} />
        },
        filter: filterForSearchQueryAndTWAP,
      },
      {
        Header: 'Pool Type',
        accessor: 'type',
        maxWidth: 100,
        Cell: (props: { value: PoolType }) => (
          <Chip label={poolTypeNameMapper[props.value]} color={chipPoolColorMapper[props.value]} />
        ),
        filter: (rows, id, filterValue) =>
          rows.filter((row) => !filterValue.length || filterValue.includes(row.values.type)),
      },
      {
        Header: 'Fee Tier',
        accessor: 'swapFeePercent',
        maxWidth: 100,
        Cell: (props) => <span>{props.value}%</span>,
        filter: feeTiersFilter,
      },
      {
        Header: 'TVL',
        accessor: 'totalValueLocked',
        maxWidth: 100,
        Cell: (props) => <span>{formatNumber(props.value, true)}</span>,
      },
      {
        Header: 'APY',
        accessor: 'apy',
        maxWidth: 100,
        Cell: (props) => <span>{formatPercent(props.value)}</span>,
      },
      {
        Header: 'Actions',
        accessor: 'actions',
        maxWidth: 100,
        Cell: ({ row: { original } }) => {
          const poolPath = `/trident/pool/${original.type.toLowerCase()}/${original.currencyIds.join('/')}`

          return (
            <Link href={poolPath} passHref>
              {/* DIV needed for forwardRef issue */}
              <div>
                <Button color="gradient" variant="outlined" className="text-sm font-bold text-white h-8">
                  Invest
                </Button>
              </div>
            </Link>
          )
        },
      },
    ]
  }, [])

  return useMemo(
    () => ({
      config: {
        columns: columns,
        data: data ?? [],
        initialState: { pageSize: 15 },
        autoResetFilters: false,
      },
      loading: isValidating,
      error,
    }),
    [columns, data, error, isValidating]
  )
}