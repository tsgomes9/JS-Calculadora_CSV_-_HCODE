//Neste arquivo ficam contidas as classes,
//que contém as regras de negócio

class CalcController {
  constructor() {
    this._audio = new Audio('click.mp3')
    this._audioOnOff = false
    this._lastOperator = ''
    this._lastNumber = ''
    this._operation = []
    this._locale = 'pt-BR'
    this._displayCalcEl = document.querySelector('#display')
    this._dateEl = document.querySelector('#date')
    this._timeEl = document.querySelector('#hour')
    this._currentDate
    this.initialize()
    this.initButtonsEvents()
    this.initKeyBoard()
  }

  /*
  ====== initialize():

  - método inicializado com o construtor para exibir data e hora

  - setInterval recebe dois parâmetros, uma arrow function e o intervalo de milisegundos no qual deve executar novamente (neste caso, 1000 milisegundos).

  - O método displayDate recebe uma nova instancia (método currentDate) e usa a função ToLocaleDateString para retornar a hora/data 
  
  */

  initialize() {
    setInterval(() => {
      this.displayDate = this.currentDate.toLocaleDateString(this._locale)
      this.displayTime = this.currentDate.toLocaleTimeString(this._locale)
    }, 1000)

    this.setLastNumberToDisplay()
    this.pasteFromClipboar()

    document.querySelectorAll('.btn-ac').forEach(btn => {
      btn.addEventListener('dblclick', e => {
        this.toggleAudio()
      })
    })
  }
  toggleAudio() {
    //liga ou desliga o botão
    this._audioOnOff = !this._audioOnOff
  }

  playAudio() {
    if (this._audioOnOff) {
      this._audio.currentTime = 0
      this._audio.play()
    }
  }

  //inicializa o teclado
  initKeyBoard() {
    document.addEventListener('keyup', e => {
      this.playAudio()

      switch (e.key) {
        case 'Escape': //botão esc
          this.clearAll()
          break
        case 'Backspace':
          this.clearEntry()
          break
        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
          this.addOperation(e.key)
          break

        case '.':
        case ',':
          this.addDot()
          break
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          this.addOperation(parseInt(e.key))
          break
        case 'Enter':
        case '=':
          this.calc()
          break
        case 'c':
          if (e.ctrlKey) this.copyToClipboard()
          //verifica se foi digitado ctrl e chama a função
          break
      }
    })
  }

  /*Função criada por se tratar de um documento SVG, 
  onde os elementos precisam de um tratamento diferente
  de documentos HTML padrão */
  copyToClipboard() {
    let input = document.createElement('input') //cria um elemento input

    input.value = this.displayCalc

    document.body.appendChild(input) // adiciona o elemento ao body

    input.select() //seleciona o conteúdo

    document.execCommand('Copy') //copia o elemento selecionado

    input.remove() //depois de copiar o conteúdo, remove o input
  }

  pasteFromClipboar() {
    document.addEventListener('paste', e => {
      let text = e.clipboardData.getData('Text')

      this.displayCalc = parseFloat(text)
    })
  }
  /*
  ==== addEventListenerAll():
  
  - método criado para receber mais de um tipo de evento 
  de uma vez e reagir a cada um individualmente
  
  ==== events.split(' ').forEach:

  - divide (por espaços) os eventos recebidos e passa por cada um

  */
  addEventListenerAll(element, events, fn) {
    events.split(' ').forEach(event => {
      element.addEventListener(event, fn, false)
    })
  }

  // limpa o array
  clearAll() {
    this._operation = []
    this._lastNumber = ''
    this._lastOperator = ''

    this.setLastNumberToDisplay()
  }
  // exclui o ultimo número do array
  clearEntry() {
    this._operation.pop()
    this.setLastNumberToDisplay()
  }

  /*
  ===== isOperator(value):

  - verificar se foi digitado/clicado um operador
  
  - indexOf verifica se value está contido no array, 
    caso encontre, retorna o index, compara com -1 (para
    verificar se existe) e retorna true ou false para a função
  */
  isOperator(value) {
    return ['+', '-', '*', '%', '/'].indexOf(value) > -1
  }

  /*
  ===== getLastOperation()
  - retorna o ultimo valor digitado verificando a ultima
  posição do array _operation*/
  getLastOperation() {
    return this._operation[this._operation.length - 1]
  }

  /*
  substitui pelo ultimo operador digitado
  */
  setLastOperation(value) {
    this._operation[this._operation.length - 1] = value
  }

  /*método para aplicar o push (adicionar item no array) e verificar a 
  quantidade de itens para somar,  a soma deve ser feita a cada dois números lidos*/
  pushOperation(value) {
    this._operation.push(value)

    if (this._operation.length > 3) {
      this.calc()
    }
  }

  //retorna o resultado da operação
  getResult() {
    try {
      return eval(this._operation.join('')) //interpreta a operação em string
    } catch (e) {
      setTimeout(() => {
        this.setError()
      }, 100)
    }
  }

  /*
  ===== calc():
  - guarda o ultimo operador digitado na variável last 
  - eval: utilizado para interpretar a string do operador digitado*/
  calc() {
    let last = ''

    this._lastOperator = this.getLastItem()

    if (this._operation.length < 3) {
      let firstItem = this._operation[0]
      this._operation = [firstItem, this._lastOperator, this._lastNumber]
    }

    if (this._operation.length > 3) {
      last = this._operation.pop()
      this._lastNumber = this.getResult()
    } else if (this._operation.length == 3) {
      this._lastNumber = this.getLastItem(false)
    }

    let result = this.getResult()

    if (last == '%') {
      result /= 100
      this._operation = [result]
    } else {
      this._operation = [result]
      if (last) this._operation.push(last)
    }

    this.setLastNumberToDisplay()
  }

  getLastItem(isOperator = true) {
    let lastItem

    for (let i = this._operation.length - 1; i >= 0; i--) {
      if (this.isOperator(this._operation[i]) == isOperator) {
        lastItem = this._operation[i]
        break
      }
    }

    if (!lastItem) {
      lastItem = isOperator ? this._lastOperator : this._lastNumber
    }

    return lastItem
  }

  /*
  ===== setLastNumberToDisplay():
  - mostra na tela o ultimo numero digitado
    verifica se o ultimo número é um operador, se for 
    define como lastNumber
  */
  setLastNumberToDisplay() {
    let lastNumber = this.getLastItem(false)

    if (!lastNumber) lastNumber = 0

    this.displayCalc = lastNumber
  }

  /*
  ===== addOperation(value):
  - cria um array dos números digitados
  
  - if (isNaN(this.getLastOperation())):
  verifica se a entrada é um operador caso receba um outro operador, 
  trocar para o ultimo clicado

  - else if (isNaN(value)):
  verifica se é um caracter não numérico

  - this.pushOperation(value):
  caso seja um numero, adiciona ao array _operation

  */
  addOperation(value) {
    if (isNaN(this.getLastOperation())) {
      if (this.isOperator(value)) {
        this.setLastOperation(value)
      } else {
        this.pushOperation(value)

        this.setLastNumberToDisplay()
      }
    } else {
      if (this.isOperator(value)) {
        this.pushOperation(value)
      } else {
        //transforma os valores em string para concatenar e depois converte novamente em inteiro para retornar
        let newValue = this.getLastOperation().toString() + value.toString()
        this.setLastOperation(newValue)

        this.setLastNumberToDisplay()
      }
    }
  }

  //função que retorna erro na tela
  setError() {
    this.displayCalc = 'Error'
  }

  addDot() {
    let lastOperation = this.getLastOperation()

    if (
      typeof lastOperation === 'string' &&
      lastOperation.split('').indexOf('.') > -1
    )
      return

    if (this.isOperator(lastOperation) || !lastOperation) {
      this.pushOperation('0.')
    } else {
      this.setLastOperation(lastOperation.toString() + '.')
    }
    this.setLastNumberToDisplay()
  }

  /*
  ===== execBtn(value):
  - função que executa um switch para reagir a cada botão pressionado
  com sua respectiva funcionalidade (números e operações) */
  execBtn(value) {
    this.playAudio()

    switch (value) {
      case 'ac':
        this.clearAll()
        break
      case 'ce':
        this.clearEntry()
        break
      case 'soma':
        this.addOperation('+')
        break
      case 'subtracao':
        this.addOperation('-')
        break
      case 'multiplicacao':
        this.addOperation('*')
        break
      case 'divisao':
        this.addOperation('/')
        break
      case 'porcento':
        this.addOperation('%')
        break
      case 'ponto':
        this.addDot()
        break
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        this.addOperation(parseInt(value))
        break
      case 'igual':
        this.calc()
        break
      default:
        this.setError()
        break
    }
  }

  //Tratamento dos botões
  initButtonsEvents() {
    let buttons = document.querySelectorAll('#buttons > g, #parts > g') //seleciona todos os itens com tag 'g' dos ids 'buttons' e 'parts'

    //função forech para percorrer cada botão da calculadora
    buttons.forEach((btn, index) => {
      //cada botão de buttons recebe a função addEventListener que deve 'ouvir' todos os eventos de click de cada um
      this.addEventListenerAll(btn, 'click drag', e => {
        let textBtn = btn.className.baseVal.replace('btn-', '') //extrai apenas o número do botão do nome da classe
        this.execBtn(textBtn)
      })
      /*função para mudar o cursor do mouse utilizando a função addEventListenerAll
      para capturar os eventos de mouse
      */
      this.addEventListenerAll(btn, 'mouseover mouseup mousedown', e => {
        btn.style.cursor = 'pointer'
      })
    })
  }

  //GETTERS AND SETTERS para controlar o acesso às variáveis

  //Display Date
  get displayDate() {
    return this._dateEl.innerHTML
  }

  set displayDate(value) {
    return (this._dateEl.innerHTML = value)
  }

  //Display Time
  get displayTime() {
    return this._timeEl.innerHTML
  }

  set displayTime(value) {
    return (this._timeEl.innerHTML = value)
  }

  //cria uma nova instancia de Date
  get currentDate() {
    return new Date()
  }

  set currentDate(value) {
    return (this._currentDate = value)
  }

  //Display Calc
  get displayCalc() {
    //retorna a variável _displayCalc
    return this._displayCalcEl.innerHTML
  }

  set displayCalc(value) {
    //recebe um parâmetro e atribui a _displayCalc

    if (value.toString().length > 10) {
      this.setError()
      return false
    }
    this._displayCalcEl.innerHTML = value
  }
}
