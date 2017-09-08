import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
	private showInputs: boolean = false;
  private formData: any = {};
	private errorMessage: boolean;

  constructor(){}

  ngOnInit(){}

  submitForm(e, f: NgForm) {
    if (!this.showInputs) {
    	this.acceptUsername(f.value.username);
    } else {
    	this.handleOutput(f.value);
    }
  }

  acceptUsername(username){
  	username ? this.showInputs = true : null;
  }

  handleOutput(form){
    let formPost = {
      username: form.username,
      recipient: form.recipient,
      message: form.message
    }

    return fetch("request/api/messages", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formPost)
        })
        .then((response) => {
          response.json().then((data) => {
            if (data.error) {
              this.errorMessage = true;
            } else {
              this.errorMessage = false;
            }
            
            this.formData = data.message
          });
        }).catch(err=>{
          console.log('err: ', err)
        });
  }
}
