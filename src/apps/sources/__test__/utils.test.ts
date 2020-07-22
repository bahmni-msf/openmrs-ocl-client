import {sourceType} from "../utils";

describe( 'sourceType', () => {

    it("should return public sources for /sources/", ()=>{
       expect(sourceType('/sources/')).toEqual('Public Sources');
    });

    it("should return your sources for /user/sources/", ()=>{
        expect(sourceType('/user/sources/')).toEqual('Your Sources');
    });

    it("should return organisation sources for /user/orgs/sources/", ()=>{
        expect(sourceType('/user/orgs/sources/')).toEqual('Your Organisations\' Sources');
    });

    it("should return sources for any other", ()=>{
        expect(sourceType('/test/')).toEqual('Sources');
    });
});