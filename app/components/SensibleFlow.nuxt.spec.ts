// import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
// import FriendlyFlow from './SensibleFlow.vue';
// import handle_enter from './SensibleFlow.vue';
// import { mountSuspended, renderSuspended } from '@nuxt/test-utils/runtime'
// import { screen, fireEvent } from '@testing-library/vue'
// //import userEvent from '@testing-library/user-event'
// import { setActivePinia, createPinia } from 'pinia'
// import { useFriendlyFlowStore } from '@/stores/FriendlyFlow'
// import { storeToRefs } from 'pinia'

// import { createTestingPinia } from '@pinia/testing' // TODO: op te zoeken als 't niet marcheert





// // TODO: deze https://github.com/vuejs/test-utils eens proberen, dat is lower level dan testing-library





// describe('ffml tests', () => {
//   ///*let*/ { rerender } = await renderSuspended(FriendlyFlow)
  
//   beforeEach(() => {
//     setActivePinia(createPinia())
//   })

//   afterEach(() => {
//   })

//   // const setup = async() => {
//   //   const utils = await renderSuspended(FriendlyFlow)
//   //   //const input: HTMLInputElement = screen.getByTestId([0].toString())
//   //   const input: HTMLInputElement = screen.getByLabelText([0].toString())
//   //   console.log("okok", input.outerHTML)
//   //   return {
//   //     input,
//   //     ...utils,
//   //   }
//   // }

//   // it('ColonError', async() => {
//   //   //let wrapper = await renderSuspended(FriendlyFlow)

//   //   //const element = wrapper.getByTestId([0].toString())

//   //   const { input } = await setup()
//   //   // fireEvent.keyPress(input, {key: 'Enter', code: 'Enter', charCode: 13})
//   //   // expect(input).toThrowError

//   //   fireEvent.change(input, {target: {value: 'ok'}})
//   //   //fireEvent.keyPress(input, {key: 'Enter', code: 'Enter', charCode: 13})
//   //   expect(input.value).toBe("ok")
//   // })

//   // it('ColonError 2', async() => {
//   //   //let wrapper = await renderSuspended(FriendlyFlow)

//   //   //const element = wrapper.getByTestId([0].toString())

//   //   const { input } = await setup()
//   //   // fireEvent.keyPress(input, {key: 'Enter', code: 'Enter', charCode: 13})
//   //   // expect(input).toThrowError

//   //   fireEvent.change(input, {target: {value: 'ok'}})
//   //   fireEvent.keyPress(input, {key: 'Enter', code: 'Enter', charCode: 13})
//   //   expect(input.value).toBe("ok")
//   // })

//   // it('ColonError', async () => {
//   //   const user = userEvent.setup()

//   //   const store = useFriendlyFlowStore()
//   //   const { ffml_struct } = storeToRefs(store)

//   //   const element = await screen.findByTestId([0].toString())
//   //   if (element) {
//   //     await user.type(element, "[Enter]")
//   //     expect(element).toThrowError
//   //     await user.type(element, ":[Enter]")
//   //     expect(element).toThrowError
//   //     await user.type(element, "test::[Enter]")
//   //     expect(element).toThrowError
//   //     await user.type(element, "test:test:[Enter]")
//   //     expect(element).toThrowError
//   //     await user.type(element, "ok[Enter]")
//   //     expect(element).toThrowError // moet error geven
//   //     await user.type(element, "ok:[Enter]")
//   //     expect(element).toThrowError // moet error geven

//   //     const el = await screen.findByTestId('left')
//   //     console.log(el.innerHTML)
//   //   }
//   // })

//   // it('ColonError', async () => {
//   //   const user = userEvent.setup()

//   //   await rerender(FriendlyFlow)

//   //   const store = useFriendlyFlowStore()
//   //   const { ffml_struct } = storeToRefs(store)
//   //   console.log("hey", ffml_struct.value) 

//   //   const element = await screen.getByTestId([0].toString());
//   //   if (element) {
//   //     // await user.type(element, "[Enter]")
//   //     // expect(element).toThrowError
//   //     // await user.type(element, ":[Enter]")
//   //     // expect(element).toThrowError
//   //     // await user.type(element, "test::[Enter]")
//   //     // expect(element).toThrowError
//   //     // await user.type(element, "test:test:[Enter]")
//   //     // expect(element).toThrowError
//   //     // await user.type(element, "ok[Enter]")
//   //     // expect(element).toThrowError
//   //     // await user.type(element, "ok:[Enter]")
//   //     // expect(element).toThrowError
//   //     // expect(screen.getByTestId([0].toString())).tohavev
//   //     // console.log("haha", element.getHTML())
//   //   }
//   // })
// })
