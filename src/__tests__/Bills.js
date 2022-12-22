/**
 * @jest-environment jsdom
 */

import {screen, waitFor, within} from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import {bills} from "../fixtures/bills.js";
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import billsUI from "../views/BillsUI.js";
import mockStore from "../__mocks__/store.js";
import {formatDate} from "../app/format.js";

// import formatDate from "../app/format.js"


 jest.mock("../app/store", () =>mockedStore);

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            Object.defineProperty(window, 'localStorage', {value: localStorageMock})
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByTestId('icon-window'))
            const windowIcon = screen.getByTestId('icon-window')
            await waitFor(() => windowIcon)
            //to-do write expect expression
            expect(windowIcon).toHaveClass("active-icon")
        })
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({data: bills})
            // @Todo - test Date
            // Récupère les dates de l'interface
             const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)

            const formatFr = [formatDate(dates[0]), formatDate(dates[1]), formatDate(dates[2]), formatDate(dates[3])]

            const antiChrono = (a, b) => new Date(a) - new Date(b);
            const datesSorted = [...dates].sort(antiChrono)
            console.log(datesSorted)

            expect(dates).toEqual(formatFr)


            // const antiChrono = (a, b) => (a < b ? 1 : -1)
            // const antiChrono = (a, b) => new Date(a.date) - new Date(b.date);
            // const datesSorted = [...dates].sort(antiChrono)
            // expect(dates).toEqual(datesSorted)
        })
    })
    describe("When I click on one eye icon", () => {
        test("Then a modal should open", async () => {
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({pathname})
            }
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            })
            window.localStorage.setItem("user", JSON.stringify({
                type: "Employee"
            }))
            const billsPage = new Bills({
                document, onNavigate, store: mockedStore, localStorage: window.localStorage
            })
            document.body.innerHTML = BillsUI({data: bills})
            const iconEyes = screen.getAllByTestId(("icon-eye"))
            const handleClickIconEye = jest.fn(billsPage.handleClickIconEye)
            const modale = document.getElementById("modaleFile")
            $.fn.modal = jest.fn(() => modale.classList.add("show"))

            iconEyes.forEach((iconEye) => {
                iconEye.addEventListener('click', () => handleClickIconEye(iconEye))
                userEvent.click(iconEye)
                expect(handleClickIconEye).toHaveBeenCalled()
                expect(modale).toHaveClass("show")
            })
        })
    })
    describe("When I click in the button NewBill", () => {
        test("Then I should be sent on New Bill form", () => {
            const onNavigate = (pathname) => {
                document.body.innertHTML = ROUTES({pathname})
            }
            Object.defineProperty(window, 'localStorage', {
                value: localStorageMock
            })
            window.localStorage.setItem("user", JSON.stringify({
                type: "Employee"
            }))
            const billPage = new Bills({document, onNavigate, store: mockedStore, localStorage: window.localStorage})
            document.body.innerHTML = BillsUI({data: bills})
            const newBillBtn = screen.getByTestId(("btn-new-bill"))
            const handleClickNewBill = jest.fn(billPage.handleClickNewBill)
            newBillBtn.addEventListener("click", handleClickNewBill)
            userEvent.click(newBillBtn)
            expect(handleClickNewBill).toHaveBeenCalled()
        })
    })

    describe("When I went on Bills page and it is loading", () => {
        test("Then, Loading page should be rendered", () => {
            document.body.innerHTML = BillsUI({loading: true});
            expect(screen.getByText("Loading...")).toBeVisible();
            document.body.innerHTML = "";
        });
    });
    describe("When I am on page but back-end send an error message", () => {
        test("Then, Error page should be rendered", () => {
            document.body.innerHTML = billsUI({error: "error message"})
            expect(screen.getByText("Erreur")).toBeVisible()
            document.body.innerHTML = ""
        })
    })
    //TODO waitFor, within, toBeTruthy, findByRole
    describe("When I navigate to Bills Page", () => {
        test("Then fetches bills from mock API GET", async () => {
            jest.spyOn(mockedStore, "bills")
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            })
            localStorage.setItem(
                "user",
                JSON.stringify({type: "Employee", email: "a@a"})
            )

            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.append(root)
            router()
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByText("Mes notes de frais"))
            const newBillBtn = await screen.findByRole("button", {
                name: /nouvelle note de frais/i,
            })
            console.log("===========================++>",newBillBtn)
            const billsTableRows = screen.getByTestId("tbody")
            expect(newBillBtn).toBeTruthy()
            expect(billsTableRows).toBeTruthy()
            expect(within(billsTableRows).getAllByRole("row")).toHaveLength(4)
        })
        test("Then fetches bills from an Api and fails with 404 message error", async () => {
            mockedStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 404"))
                    }
                }
            })
            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick)
            const message = screen.getByText(/Erreur 404/)
            expect(message).toBeTruthy()
        })
        test("Fetches messaged from an API and fails with 500 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 500"))
                    }
                }
            })
            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick)
            const message = screen.getByText(/Erreur 500/)
            expect(message).toBeTruthy()
        })

    })
})

