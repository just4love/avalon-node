/**
 * @fileoverview
 * @author 张挺 <zhangting@taobao.com>
 *
 */
var assert = require("assert"),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore');

var text = '<pagecache cacheable="false" src="$control.setTemplate("wsproductdetail:buyNowForm.vm").setParameter("productInfo",$productInfo).setParameter("currentMember",$currentMember).setParameter("tradeCountInfoView",$tradeCountInfoView).setParameter("wsScoreSessionId",$!{sessionId}).setParameter("feedbackRatingView",$!{feedbackRatingView}).setParameter("transactionbp",$!{transactionbp})"/> </div> </div> <pagecache cacheable="false" src="$control.setTemplate("wsproductdetail:productImage.vm").setParameter("imageDetail",$imageDetail).setParameter("productInfo",$productInfo).setParameter("productShareURLView",$productShareURLView)"/> ';

describe('test reg', function() {
    it('test xregexp', function() {
        var result = text.replace(/<pagecache.*?\/>/g, function(matched){
            if(/\$control.*\)/.test(matched)) {
                return matched.match(/\$control.*\)/)[0]
            }
            return matched
        });

        console.log(result);
    });
});