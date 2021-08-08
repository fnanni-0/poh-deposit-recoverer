import { BigNumber, Contract, ethers, providers } from "ethers";
import { isAddress } from "ethers/lib/utils";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Base } from "./Base";
import pohJson from '../proof-of-humanity.json';

const POH_ABI = pohJson.abi;

export class ExecuteRequest extends Base {
  private _provider: providers.JsonRpcProvider;
  private _human: string;
  private _pohContract: Contract;

  constructor(provider: providers.JsonRpcProvider, human: string, _pohAddress: string) {
    super()
    if (!isAddress(human)) throw new Error("Bad Address")
    this._human = human;
    this._provider = provider;
    this._pohContract = new Contract(_pohAddress, POH_ABI, provider);
  }

  async description(): Promise<string> {
    return "Submit POH profile " + this._human.toString() + " @ " + this._pohContract.address + "  sponsored by donor."
  }

  async isExecutionPending(humanAddress: string): Promise<BigNumber> {
    const roundInfo = (await this._pohContract.functions
      .getContributions(
        humanAddress,
        0,
        0,
        0,
        humanAddress
      )
    );
    return roundInfo.contributions[1].gt(0);
  }

  async getSponsoredTransactions(): Promise<Array<TransactionRequest>> {
    const isExecutionPending = await this.isExecutionPending(this._human)
    if (!isExecutionPending) {
      throw new Error(`Profile already exists: ${this._human}`)
    }
    return [{
      ...(await this._pohContract.populateTransaction.executeRequest(this._human)),
    }]
  }
}