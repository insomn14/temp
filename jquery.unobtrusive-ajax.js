var onBegin = function () {
  $("#overlay").css("display", "block");
  const guestToken = getCookie("ACCESS_TOKEN");
  if(guestToken && guestToken!==''){
    localStorage.setItem( 'guestToken', guestToken);
  }
};

var onComplete = function () {
  grecaptcha.reset();
};

var onSuccess = function (data) {
  const linkEcom = window.SBSG.appSettings.config.EcomUrl;
  if (data.success === false) {
    $("#overlay").css("display", "none");
    $("#loginmsgcontent").html(data.message);
    $("#LoginMessageModal").modal({ show: true });
    // reset the google reCAPTCHA
  } else {
    if (data.token) {
      //setCookie("ACCESS_TOKEN", "", -9999999, data.token.domain);
      //setCookie(
      //  "ACCESS_TOKEN",
      //  data.token.accessToken,
      //  data.token.expireInSeconds,
      //  data.token.domain
      //);
    }

    // Login/?EcomUrl=https://starbucks-uat-ecomm.ascentis.com.sg/cart/shopping-cart?Step=4
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const EcomUrl = urlParams.get('EcomUrl')

    if (EcomUrl && EcomUrl !== "") {
      localStorage.setItem('EcomUrl', EcomUrl);
    }

    const cardId = localStorage.getItem("GuestCardId");
    if (!cardId) {
      window.location = data.returnurl;
    }

    const guestToken = localStorage.getItem("guestToken");
    if (cardId && cardId !== 0) {
      const params = {
        shoppingCart_AutoId: cardId,
        guestToken: guestToken
      };
      const callFunction = async function callApi() {
        const res = await fetch(
          `${linkEcom}/api/cart/TransferCartToCurrenCustomer`,
          {
            body: JSON.stringify(params),
            method: "POST",
            credentials: "include",
            redirect: "follow",
            sameSite: "None",
            headers: {
              'Content-Type': 'application/json'
            },
          }
        ).then((response) => {
          if (response.ok) {
            return response.json();
          }
        });
        await localStorage.clear();
        window.location = data.returnurl;
      };

      callFunction();
    }
  }
};

var onFailed = function (context) {
  $("#overlay").css("display", "none");
};