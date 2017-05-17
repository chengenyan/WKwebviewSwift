//
//  ViewController.swift
//  WKwebviewSwiftcey
//
//  Created by apple on 2017/5/17.
//  Copyright © 2017年 apple. All rights reserved.
//

import UIKit
import WebKit
import JavaScriptCore
class ViewController: UIViewController,WKNavigationDelegate,WKScriptMessageHandler,WKUIDelegate {
    var urlstr:String=""
    var myTitle:String="活动"
    var web:WKWebView?
    var isshare:Bool=false
    var mysahredict:NSDictionary?
    override func viewDidLoad() {
        super.viewDidLoad()
        self.navigationItem.title=myTitle
        urlstr=String.init(format: "%@",Bundle.main.path(forResource: "umshareapp", ofType: "html")!)
        
        creatwebview()
       
        // Do any additional setup after loading the view.
    }
 
    func creatwebview()  {
        if urlstr != "" {
            // js配置
            let config=WKWebViewConfiguration()
            config.preferences=WKPreferences()
            config.preferences.minimumFontSize=10
            config.preferences.javaScriptEnabled=true
            config.preferences.javaScriptCanOpenWindowsAutomatically=false
            config.userContentController.add(self, name: "sharebtnclick")
            web = WKWebView.init(frame:  CGRect(x:0,y:64,width:300,height:400), configuration: config)
            web?.backgroundColor=UIColor.green
            self.view.addSubview(web!)
          
        ///Users/sunya/Desktop/ww/WKwebviewSwiftcey/WKwebviewSwiftcey
            /// 根据URL创建请求
           // let requst = NSURLRequest.init(url: URL.init(string: urlstr)!)
            /// 设置代理
            //        web.uiDelegate = self
            web?.navigationDelegate = self
            web?.uiDelegate=self
            /// WKWebView加载请求
//            web?.load(requst as URLRequest),网络请求
            let basestring=urlstr.replacingOccurrences(of: "/umshareapp.html", with: "")
            web?.loadFileURL(URL.init(fileURLWithPath: urlstr), allowingReadAccessTo: URL.init(fileURLWithPath: basestring))
       
//            [self.wkWebView loadFileURL:fileURL allowingReadAccessToURL:baseUrl];
//            注意:
//            fileURL,是需要加载的HTML文件路径
//            baseUrl,是HTML的上一级文件路径.这是坑点,baseUrl和fileURL不能相同!!!!!!
            
        }
    }
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        if web != nil {
            web?.configuration.userContentController.removeScriptMessageHandler(forName: "sharebtnclick")
        }
    }
    
    func sharebtnclick(_ str:String)   {
      print("html调用oc")
    }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        print(message)
        if message.name == "sharebtnclick" {
            sharebtnclick("好友分享")//分享方法被调用
        }
        
    }
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView){
         webView.reload()
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        print("数据加载成功" as AnyObject)
        //直接调用
        self.web?.evaluateJavaScript("appbtnclick()", completionHandler: { (response, error) in
            //
            if error==nil {
                print("调用成功");
            }else{
                print(error!);
            }
        })
      
    }
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("数据获取失败" as AnyObject)
    }
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        //代理方法截取字符串不跳转
        let url=navigationAction.request.url?.absoluteString
        print(url!)
        if (url?.components(separatedBy: "sharebtnclick").count)! > 1 {
            decisionHandler(WKNavigationActionPolicy.cancel)//不跳转
            return
        }
        decisionHandler(WKNavigationActionPolicy.allow);//跳转
    }
    
    ///UIWebViewdelegate,必须实现,才能出现弹窗
    /// 创建一个新的WebView
//    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
//        
//    }
    
    /// 确认框
    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alert=UIAlertController.init(title: message, message: nil, preferredStyle: UIAlertControllerStyle.alert)
        alert.addAction(UIAlertAction.init(title: "确定", style: UIAlertActionStyle.cancel, handler: { (action) in
            completionHandler(false)
        }))
        self.present(alert, animated: true) {
            
        }
    }

        /// 输入框
    func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (String?) -> Void) {
      
         completionHandler("Client Not handler")
    }
    /// 警告框
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert=UIAlertController.init(title: message, message: nil, preferredStyle: UIAlertControllerStyle.alert)
        alert.addAction(UIAlertAction.init(title: "取消", style: UIAlertActionStyle.cancel, handler: { (action) in
        
             completionHandler()
         
        }))
        alert.addAction(UIAlertAction.init(title: "确定", style: UIAlertActionStyle.default, handler: { (action) in
            completionHandler()
            print("点击确认按钮")
        }))
        self.present(alert, animated: true) {
            
        }
    }
    deinit{
        if web != nil {
            web?.navigationDelegate = nil
            web?.uiDelegate = nil
            web?.configuration.userContentController.removeScriptMessageHandler(forName: "sharebtnclick")
        }
    }
    
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    
    /*
     // MARK: - Navigation
     
     // In a storyboard-based application, you will often want to do a little preparation before navigation
     override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
     // Get the new view controller using segue.destinationViewController.
     // Pass the selected object to the new view controller.
     }
     */
    
}

