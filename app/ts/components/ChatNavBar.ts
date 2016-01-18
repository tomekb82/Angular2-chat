import {Component, OnInit} from 'angular2/core';
import {MessagesService, ThreadsService} from '../services/services';
import {Message, Thread} from '../models';
import * as _ from 'underscore';

@Component({
  selector: 'nav-bar',
  template: `

  <nav class="navbar navbar-default" style="padding-top: 10px">
      <div id="badge">
        <h4>Version</h4>
        <h3>Development</h3>
      </div>
      <div class="container-fluid">
          <div class="navbar-header">
             <a class="navbar-brand" href="#"><img id="logo" src="${require('images/logos/chat.png')}" />Chat App</a>
          </div>
          <ul class="nav navbar-nav">
              <li class="active"><a href="#">Home</a></li>
              <li><a href="#">New user</a></li>
              <li><a href="#">Page 2</a></li>
              <li><a href="#">Page 3</a></li>
          </ul>
          <p class="navbar-text navbar-right">
            <button class="btn btn-primary" type="button">
              Messages <span class="badge">{{unreadMessagesCount}}</span>
            </button>
          </p>
      </div>
  </nav>

  `
})
export class ChatNavBar implements OnInit {
  unreadMessagesCount: number;

  constructor(public messagesService: MessagesService,
              public threadsService: ThreadsService) {
  }

  ngOnInit(): void {
    this.messagesService.messages
      .combineLatest(
        this.threadsService.currentThread,
        (messages: Message[], currentThread: Thread) =>
          [currentThread, messages] )

      .subscribe(([currentThread, messages]: [Thread, Message[]]) => {
        this.unreadMessagesCount =
          _.reduce(
            messages,
            (sum: number, m: Message) => {
              let messageIsInCurrentThread: boolean = m.thread &&
                currentThread &&
                (currentThread.id === m.thread.id);
              if (m && !m.isRead && !messageIsInCurrentThread) {
                sum = sum + 1;
              }
              return sum;
            },
            0);
      });
  }
}

