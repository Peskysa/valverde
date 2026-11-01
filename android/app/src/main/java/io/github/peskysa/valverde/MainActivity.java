package io.github.peskysa.valverde;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.webkit.*;
import android.view.WindowInsets;
import org.json.JSONObject;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.net.URLConnection;

/** SPDX-License-Identifier: AGPL-3.0-only · Marco Pescador */
public class MainActivity extends Activity {
    private WebView web;
    private String pendingContent;
    private ValueCallback<Uri[]> fileCallback;
    private static final int SAVE=10, OPEN=11;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        web=new WebView(this);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(true);
        web.getSettings().setSupportMultipleWindows(false);
        web.addJavascriptInterface(new Files(),"AndroidFiles");
        web.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onShowFileChooser(WebView v,ValueCallback<Uri[]> callback,FileChooserParams params){
                if(fileCallback!=null)fileCallback.onReceiveValue(null);
                fileCallback=callback;
                Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("*/*");i.putExtra(Intent.EXTRA_MIME_TYPES,new String[]{"text/csv","text/plain","application/csv"});
                try{startActivityForResult(i,OPEN);}catch(Exception e){fileCallback.onReceiveValue(null);fileCallback=null;}
                return true;
            }
        });
        web.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){
                Uri u=r.getUrl();if("https".equals(u.getScheme())&&"github.com".equals(u.getHost())&&u.getPath()!=null&&u.getPath().startsWith("/Peskysa")){
                    try{startActivity(new Intent(Intent.ACTION_VIEW,u));}catch(Exception e){}
                }
                return true;
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView v,WebResourceRequest r){
                Uri url=r.getUrl();String p=url.getPath();
                if(!"https".equals(url.getScheme())||!"app.local".equals(url.getHost())||p==null||p.contains(".."))return missing();
                String file=p.equals("/")?"index.html":p.substring(1);
                String mime=file.endsWith(".js")?"text/javascript":file.endsWith(".css")?"text/css":file.endsWith(".svg")?"image/svg+xml":URLConnection.guessContentTypeFromName(file);
                try{return new WebResourceResponse(mime==null?"application/octet-stream":mime,"UTF-8",getAssets().open(file));}catch(IOException e){return missing();}
            }
            private WebResourceResponse missing(){return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",null,new ByteArrayInputStream(new byte[0]));}
        });
        setContentView(web);
        if(android.os.Build.VERSION.SDK_INT>=30){web.setOnApplyWindowInsetsListener((v,insets)->{android.graphics.Insets b=insets.getInsets(WindowInsets.Type.systemBars());v.setPadding(b.left,b.top,b.right,b.bottom);return insets;});web.requestApplyInsets();}
        web.loadUrl("https://app.local/");
    }
    public class Files {
        @JavascriptInterface public void save(String name,String content){runOnUiThread(()->{
            if(pendingContent!=null||content.length()>2000000||!name.matches("[A-Za-z0-9-]{1,80}\\.(csv|json)"))return;
            pendingContent=content;Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType(name.endsWith(".json")?"application/json":"text/csv");i.putExtra(Intent.EXTRA_TITLE,name);
            try{startActivityForResult(i,SAVE);}catch(Exception e){pendingContent=null;result("No se pudo abrir el selector.");}
        });}
    }
    private void result(String message){web.evaluateJavascript("if(window.fileResult)window.fileResult("+JSONObject.quote(message)+")",null);}
    @Override protected void onActivityResult(int request,int code,Intent data){super.onActivityResult(request,code,data);
        if(request==OPEN&&fileCallback!=null){fileCallback.onReceiveValue(code==RESULT_OK&&data!=null?new Uri[]{data.getData()}:null);fileCallback=null;return;}
        if(request!=SAVE)return;
        if(code!=RESULT_OK||data==null){pendingContent=null;result("Operación cancelada.");return;}
        try{if(pendingContent!=null){try(OutputStream out=getContentResolver().openOutputStream(data.getData())){if(out==null)throw new IOException();out.write(pendingContent.getBytes(StandardCharsets.UTF_8));}result("Archivo guardado.");}}catch(Exception e){result("No se pudo guardar el archivo.");}finally{pendingContent=null;}
    }
    @Override public void onBackPressed(){moveTaskToBack(true);}
    @Override protected void onDestroy(){if(fileCallback!=null)fileCallback.onReceiveValue(null);web.removeJavascriptInterface("AndroidFiles");web.destroy();super.onDestroy();}
}
