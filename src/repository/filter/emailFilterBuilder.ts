import { FilterQuery } from "mongoose";
import { IEmail } from "../../models/email";

export class EmailFilterBuilder {
    static buildFilter(params: any): FilterQuery<IEmail> {
        const query: FilterQuery<IEmail> = {};

        if (params.status) {
            query.status = params.status;
        }

        if (params.sender) {
            query.sender = params.sender;
        }

        if (params.to) {
            query.to = params.to;
        }

        if (params.apiKeyUser) {
            query.apiKeyUser = params.apiKeyUser;
        }

        if (params.sentAfter) {
            query.sentAt = { ...(query.sentAt || {}), $gte: new Date(params.sentAfter) };
        }

        if (params.sentBefore) {
            query.sentAt = { ...(query.sentAt || {}), $lte: new Date(params.sentBefore) };
        }

        return query;
    }
}