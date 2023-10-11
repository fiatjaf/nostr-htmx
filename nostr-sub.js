/* globals htmx */

var api
var element
htmx.defineExtension('nostr-sub', {
  init(apiRef) {
    api = apiRef
  },
  onEvent(name, evt) {
    switch (name) {
      case 'htmx:trigger': {
        element = evt.target
        let data = api.getInternalData(element)
        console.log('triggering subscription', evt, evt.target.field.value)
        subscribe(data)
        break
      }
      case 'htmx:beforeCleanupElement': {
        console.log('canceling subscription')
        let data = api.getInternalData(element)
        clearInterval(data.sub)
        break
      }
    }
  }
})

function subscribe(data) {
  let count = 0
  data.sub = setInterval(() => {
    count++
    api.triggerEvent(element, 'htmx:nostr-sub-event')

    let response = `{"id":"43045ce93a90816f5d8583270872bf7f97915f42462f44ebdc5967f12affebe6","pubkey":"79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798","created_at":1697065149,"kind":1,"tags":[],"content":"hello from the nostr army knife ${count}","sig":"d422798689423d61b25a7b66239668c7213965e62435d0c60747670a8d20fd3f3ffbcc6c43b83394e696e6566118288044becdc3d11fdddc1cce7f28ab5a70e6"}`

    api.withExtensions(element, function (extension) {
      response = extension.transformResponse(response, null, element)
    })

    var settleInfo = api.makeSettleInfo(element)
    var fragment = api.makeFragment(response)
    if (fragment.children.length) {
      var children = Array.from(fragment.children)
      for (var i = 0; i < children.length; i++) {
        api.oobSwap(
          api.getAttributeValue(children[i], 'hx-swap-oob') || 'true',
          children[i],
          settleInfo
        )
      }
    }
    api.settleImmediately(settleInfo.tasks)
  }, 5000)
}
