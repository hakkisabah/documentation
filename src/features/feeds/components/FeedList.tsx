/** @jsxImportSource preact */
import { useEffect, useState } from "preact/hooks"
import { MainnetTable, TestnetTable } from "./Tables"
import feedList from "./FeedList.module.css"
import { clsx } from "~/lib"
import button from "@chainlink/design-system/button.module.css"
import { updateTableOfContents } from "~/components/RightSidebar/TableOfContents/tocStore"
import { ALL_CHAINS, Chain, CHAINS, SOLANA_CHAINS } from "../data/chains"
import { useGetChainMetadata } from "./useGetChainMetadata"
import { ChainMetadata } from "../api"
import useQueryString from "~/hooks/useQueryString"

export type DataFeedType = "default" | "por" | "nftFloor"
export const FeedList = ({
  dataFeedType = "default",
  ecosystem = "",
  initialCache,
}: {
  initialNetwork: string
  dataFeedType: DataFeedType
  ecosystem?: string
  initialCache?: Record<string, ChainMetadata>
}) => {
  const chains = ecosystem === "deprecating" ? ALL_CHAINS : ecosystem === "solana" ? SOLANA_CHAINS : CHAINS

  const [selectedChain, setSelectedChain] = useQueryString("network", chains[0].page)
  const [showExtraDetails, setShowExtraDetails] = useState(false)

  const chainMetadata = useGetChainMetadata(chains.filter((chain) => chain.page === selectedChain)[0], { initialCache })

  function handleNetworkSelect(chain: Chain) {
    setSelectedChain(chain.page)
  }

  useEffect(() => {
    updateTableOfContents()
  }, [chainMetadata.processedData])

  const isPor = dataFeedType === "por"
  const isNftFloor = dataFeedType === "nftFloor"
  const isDefault = !isPor && !isNftFloor
  const isDeprecating = ecosystem === "deprecating"
  const isSolana = ecosystem === "solana"
  return (
    <>
      <div className="content" style={{ marginTop: "var(--space-4x)" }}>
        <section>
          {!isSolana && !isDeprecating && (
            <div class={feedList.clChainnavProduct} id="networks-list">
              <div>
                <div>
                  {chains
                    .filter((chain) => {
                      if (isPor) return chain.tags?.includes("proofOfReserve")

                      if (isNftFloor) return chain.tags?.includes("nftFloorPrice")

                      return chain.tags?.includes("default")
                    })
                    .map((chain) => (
                      <button
                        key={chain.page}
                        id={chain.page}
                        role="tab"
                        aria-selected={selectedChain === chain.page}
                        class={clsx(button.tertiary, feedList.networkSwitchButton)}
                        onClick={() => handleNetworkSelect(chain)}
                      >
                        <img src={chain.img} title={chain.label} loading="lazy" />
                        <span>{chain.label}</span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {(selectedChain === "arbitrum" || selectedChain === "optimism" || selectedChain === "metis") && (
            <p>
              This is an L2 network. As a best practice, use the L2 sequencer feed to verify the status of the sequencer
              when running applications on L2 networks. See the{" "}
              <a href="/docs/data-feeds/l2-sequencer-feeds/">L2 Sequencer Uptime Feeds</a> page for examples.
            </p>
          )}

          {chainMetadata.processedData?.networkStatusUrl && !isDeprecating && (
            <p>
              Track the status of this network at{" "}
              <a href={chainMetadata.processedData?.networkStatusUrl}>
                {chainMetadata.processedData?.networkStatusUrl}
              </a>
            </p>
          )}

          {chainMetadata.error && <p>There was an error loading the feeds...</p>}

          {chainMetadata.loading && !chainMetadata.processedData && <p>Loading...</p>}
          {chainMetadata.processedData?.networks
            .filter((network) => {
              if (isDeprecating) {
                let foundDeprecated = false
                network.metadata?.forEach((feed) => {
                  if (feed.docs?.shutdownDate) foundDeprecated = true
                })
                return foundDeprecated
              }

              if (isPor) return network.tags?.includes("proofOfReserve")

              if (isNftFloor) return network.tags?.includes("nftFloorPrice")

              return true
            })
            .map((network) => (
              <>
                {network.networkType === "mainnet" ? (
                  <div key={network.name}>
                    <h2 id={network.name}>
                      {network.name}{" "}
                      <a className="anchor" href={`#${network.name}`}>
                        <img src="/images/link.svg" alt="Link to this section" />
                      </a>
                    </h2>
                    {network.name === "HECO Mainnet" && (
                      <div>
                        <p>
                          Due to the shutdown of{" "}
                          <a href="https://twitter.com/HECO_Chain/status/1546797356481478656">Stars Bridge</a>, which{" "}
                          served as the canonical bridge between HECO and Ethereum, the lack of ongoing support and{" "}
                          development of the HECO blockchain, and the continued degradation in on-chain activity and{" "}
                          DeFi TVL impacting oracle network sustainability, all Chainlink Data Feeds on HECO are planned{" "}
                          to be deprecated on November 23, 2022.
                        </p>
                        <br />
                        <p>
                          Chainlink Labs is actively working with users on HECO to scope out next steps and to support{" "}
                          their dApps across additional blockchains that they are deployed on. Users with additional{" "}
                          questions are encouraged to reach out{" "}
                          <a href="https://chainlinkcommunity.typeform.com/s/dataFeedQs">here</a>.
                        </p>
                      </div>
                    )}
                    <label>
                      <input
                        type="checkbox"
                        className="extra"
                        checked={showExtraDetails}
                        onChange={() => setShowExtraDetails((old) => !old)}
                      />{" "}
                      Show more details
                    </label>
                    <MainnetTable
                      network={network}
                      showExtraDetails={showExtraDetails}
                      dataFeedType={dataFeedType}
                      ecosystem={ecosystem}
                    />
                  </div>
                ) : (
                  ecosystem !== "deprecating" && (
                    <div key={network.name}>
                      <h2 id={network.name}>
                        {network.name}{" "}
                        <a className="anchor" href={`#${network.name}`}>
                          <img src="/images/link.svg" alt="Link to this section" />
                        </a>
                      </h2>
                      <label>
                        <input
                          type="checkbox"
                          className="extra"
                          checked={showExtraDetails}
                          onChange={() => setShowExtraDetails((old) => !old)}
                        />{" "}
                        Show more details
                      </label>
                      <TestnetTable network={network} showExtraDetails={showExtraDetails} dataFeedType={dataFeedType} />
                    </div>
                  )
                )}
              </>
            ))}
        </section>
      </div>
    </>
  )
}
