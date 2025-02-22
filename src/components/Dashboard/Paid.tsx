import { RightCircleOutlined } from '@ant-design/icons'
import { BigNumber } from '@ethersproject/bignumber'
import { Progress, Tooltip } from 'antd'
import CurrencySymbol from 'components/shared/CurrencySymbol'
import EtherscanLink from 'components/shared/EtherscanLink'
import ProjectTokenBalance from 'components/shared/ProjectTokenBalance'
import TooltipLabel from 'components/shared/TooltipLabel'
import { ProjectContext } from 'contexts/projectContext'
import { ThemeContext } from 'contexts/themeContext'
import useContractReader from 'hooks/ContractReader'
import { useCurrencyConverter } from 'hooks/CurrencyConverter'
import { useEthBalance } from 'hooks/EthBalance'
import { ContractName } from 'models/contract-name'
import { CSSProperties, useContext, useMemo, useState } from 'react'
import { bigNumbersDiff } from 'utils/bigNumbersDiff'
import { formatWad, fracDiv, fromWad, parseWad } from 'utils/formatNumber'
import { hasFundingTarget } from 'utils/fundingCycle'

import BalancesModal from '../modals/BalancesModal'
import { readNetwork } from 'constants/networks'
import { NetworkName } from 'models/network-name'

export default function Paid() {
  const [balancesModalVisible, setBalancesModalVisible] = useState<boolean>()
  const {
    theme: { colors },
  } = useContext(ThemeContext)

  const {
    projectId,
    currentFC,
    balanceInCurrency,
    balance,
    owner,
    earned,
  } = useContext(ProjectContext)

  const converter = useCurrencyConverter()

  const totalOverflow = useContractReader<BigNumber>({
    contract: ContractName.TerminalV1,
    functionName: 'currentOverflowOf',
    args: projectId ? [projectId.toHexString()] : null,
    valueDidChange: bigNumbersDiff,
    updateOn: useMemo(
      () =>
        projectId
          ? [
              {
                contract: ContractName.TerminalV1,
                eventName: 'Pay',
                topics: [[], projectId.toHexString()],
              },
              {
                contract: ContractName.TerminalV1,
                eventName: 'Tap',
                topics: [[], projectId.toHexString()],
              },
            ]
          : undefined,
      [projectId],
    ),
  })

  const ownerBalance = useEthBalance(owner)

  const percentPaid = useMemo(
    () =>
      balanceInCurrency && currentFC?.target
        ? fracDiv(balanceInCurrency.toString(), currentFC.target.toString()) *
          100
        : 0,
    [currentFC?.target, balanceInCurrency],
  )

  const percentOverflow = fracDiv(
    balanceInCurrency?.add(currentFC?.target ?? 0).toString() ?? '0',
    balanceInCurrency?.add(currentFC?.tapped ?? 0)?.toString() ?? '1',
  )

  const primaryTextStyle: CSSProperties = {
    fontWeight: 500,
    fontSize: '1.1rem',
    lineHeight: 1,
  }

  const secondaryTextStyle: CSSProperties = {
    textTransform: 'uppercase',
    color: colors.text.tertiary,
    fontSize: '0.8rem',
    fontWeight: 500,
  }

  if (!currentFC) return null

  const spacing =
    hasFundingTarget(currentFC) && currentFC.target.gt(0) ? 15 : 10

  const formatCurrencyAmount = (amt: BigNumber | undefined) =>
    amt ? (
      <>
        {currentFC.currency.eq(1) ? (
          <span>
            <Tooltip
              title={
                <span>
                  <CurrencySymbol currency={0} />
                  {formatWad(converter.usdToWei(fromWad(amt)), {
                    decimals: 2,
                  })}
                </span>
              }
            >
              <CurrencySymbol currency={1} />
              {formatWad(amt, { decimals: 2 })}
            </Tooltip>
          </span>
        ) : (
          <span>
            <CurrencySymbol currency={0} />
            {formatWad(amt, { decimals: 2 })}
          </span>
        )}
      </>
    ) : null

  const isConstitutionDAO =
    readNetwork.name === NetworkName.mainnet && projectId?.eq(36)

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: spacing,
        }}
      >
        <span style={secondaryTextStyle}>
          <TooltipLabel
            label="Volume"
            tip="The total amount received by this project since it was created."
          />
        </span>
        <span style={primaryTextStyle}>
          {isConstitutionDAO && (
            <span style={secondaryTextStyle}>
              <CurrencySymbol currency={1} />
              {formatWad(converter.wadToCurrency(earned, 1, 0), {
                decimals: 2,
              })}{' '}
            </span>
          )}
          <span
            style={{
              color: isConstitutionDAO
                ? colors.text.brand.primary
                : colors.text.primary,
            }}
          >
            <CurrencySymbol currency={0} />
            {earned?.lt(parseWad('1')) && earned.gt(0)
              ? '<1'
              : formatWad(earned, { decimals: 0 })}
          </span>
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'nowrap',
        }}
      >
        <div style={secondaryTextStyle}>
          <TooltipLabel
            label="In Juicebox"
            tip="The balance of this project in the Juicebox contract."
          />
        </div>

        <div
          style={{
            ...primaryTextStyle,
            color: isConstitutionDAO
              ? colors.text.primary
              : colors.text.brand.primary,
            marginLeft: 10,
          }}
        >
          {currentFC.currency.eq(1) ? (
            <span style={secondaryTextStyle}>
              <CurrencySymbol currency={0} />
              {formatWad(balance, { decimals: 2 })}{' '}
            </span>
          ) : (
            ''
          )}
          {formatCurrencyAmount(balanceInCurrency)}
        </div>
      </div>

      {hasFundingTarget(currentFC) &&
        (currentFC.target.gt(0) ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <div style={secondaryTextStyle}>
              <TooltipLabel
                label="Distributed"
                tip="The amount that has been distributed from the Juicebox balance in this funding cycle, out of the current funding target. No more than the funding target can be distributed in a single funding cycle—any remaining ETH in Juicebox is overflow, until the next cycle begins."
              />
            </div>

            <div
              style={{
                ...secondaryTextStyle,
                color: colors.text.primary,
              }}
            >
              {formatCurrencyAmount(currentFC.tapped)} /{' '}
              {formatCurrencyAmount(currentFC.target)}
            </div>
          </div>
        ) : (
          <div
            style={{
              ...secondaryTextStyle,
              textAlign: 'right',
            }}
          >
            <TooltipLabel
              tip="The target for this funding cycle is 0, meaning all funds in Juicebox are currently considered overflow. Overflow can be redeemed by token holders, but not distributed."
              label="100% overflow"
            />
          </div>
        ))}

      {hasFundingTarget(currentFC) &&
        currentFC.target.gt(0) &&
        (totalOverflow?.gt(0) ? (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Progress
              style={{
                width: (1 - percentOverflow) * 100 + '%',
                minWidth: 10,
              }}
              percent={100}
              showInfo={false}
              strokeColor={colors.text.brand.primary}
            />
            <div
              style={{
                minWidth: 4,
                height: 15,
                borderRadius: 2,
                background: colors.text.primary,
                marginLeft: 5,
                marginRight: 5,
                marginTop: 3,
              }}
            ></div>
            <Progress
              style={{
                width: percentOverflow * 100 + '%',
                minWidth: 10,
              }}
              percent={100}
              showInfo={false}
              strokeColor={colors.text.brand.primary}
            />
          </div>
        ) : (
          <Progress
            percent={percentPaid ? Math.max(percentPaid, 1) : 0}
            showInfo={false}
            strokeColor={colors.text.brand.primary}
          />
        ))}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginTop: spacing,
        }}
      >
        <span style={secondaryTextStyle}>
          <TooltipLabel
            label="In wallet"
            tip={
              <div>
                <p>
                  The balance of the wallet that owns this Juicebox project.
                </p>
                <span style={{ userSelect: 'all' }}>{owner}</span>{' '}
                <EtherscanLink value={owner} type="address" />
              </div>
            }
          />
        </span>
        <span>
          <span style={secondaryTextStyle}>
            <ProjectTokenBalance
              style={{ display: 'inline-block' }}
              wallet={owner}
              projectId={BigNumber.from('0x01')}
              hideHandle
            />{' '}
            +{' '}
          </span>
          <span style={primaryTextStyle}>
            <CurrencySymbol currency={0} />
            {formatWad(ownerBalance, { decimals: 2 })}
          </span>
        </span>
      </div>

      <div
        style={{
          textAlign: 'right',
        }}
      >
        <span
          style={{ ...secondaryTextStyle, cursor: 'pointer' }}
          onClick={() => setBalancesModalVisible(true)}
        >
          All assets <RightCircleOutlined />
        </span>
      </div>

      <BalancesModal
        visible={balancesModalVisible}
        onCancel={() => setBalancesModalVisible(false)}
      />
    </div>
  )
}
